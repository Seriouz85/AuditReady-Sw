/**
 * ClusteringUtils.ts
 * Clustering algorithms and utilities for requirement similarity analysis
 * Extracted from SimilarityEngine for better maintainability
 */

import { ProcessedRequirement, ClusterInfo } from './types';

export interface ClusteringOptions {
  algorithm: 'k-means' | 'hierarchical' | 'dbscan' | 'agglomerative';
  min_similarity: number;
  max_clusters: number;
  min_cluster_size: number;
  quality_threshold: number;
  enable_validation: boolean;
}

export class ClusteringUtils {
  /**
   * K-means clustering implementation
   */
  static async performKMeansClustering(
    requirements: ProcessedRequirement[],
    options: ClusteringOptions
  ): Promise<ClusterInfo[]> {
    const k = Math.min(options.max_clusters, Math.ceil(requirements.length / options.min_cluster_size));
    const maxIterations = 100;
    
    // Initialize centroids randomly
    let centroids = ClusteringUtils.initializeRandomCentroids(requirements, k);
    let clusters: ClusterInfo[] = [];
    let iteration = 0;
    let converged = false;

    while (iteration < maxIterations && !converged) {
      // Assign requirements to nearest centroids
      const assignments = ClusteringUtils.assignToCentroids(requirements, centroids);
      
      // Create cluster info
      const newClusters = ClusteringUtils.createClustersFromAssignments(assignments, requirements);
      
      // Update centroids
      const newCentroids = ClusteringUtils.updateCentroids(newClusters, requirements);
      
      // Check convergence
      converged = ClusteringUtils.checkCentroidConvergence(centroids, newCentroids);
      
      centroids = newCentroids;
      clusters = newClusters;
      iteration++;
    }

    return clusters.filter(cluster => cluster.size >= options.min_cluster_size);
  }

  /**
   * Hierarchical clustering implementation
   */
  static async performHierarchicalClustering(
    requirements: ProcessedRequirement[],
    options: ClusteringOptions
  ): Promise<ClusterInfo[]> {
    // Create distance matrix
    const distanceMatrix = await ClusteringUtils.createDistanceMatrix(requirements);
    
    // Initialize each requirement as its own cluster
    let clusters = requirements.map((req, index) => ({
      cluster_id: `h_${index}`,
      size: 1,
      centroid: req,
      members: [req.id],
      quality_score: 1.0,
      dominant_concepts: req.keywords.slice(0, 5)
    }));

    // Merge clusters until we reach target number or similarity threshold
    while (clusters.length > 1 && clusters.length > Math.max(1, requirements.length / options.min_cluster_size)) {
      const { cluster1Index, cluster2Index, similarity } = ClusteringUtils.findClosestClusters(clusters, distanceMatrix, requirements);
      
      if (similarity < options.min_similarity) break;
      
      // Merge clusters
      const mergedCluster = ClusteringUtils.mergeClusters(clusters[cluster1Index], clusters[cluster2Index], requirements);
      
      // Remove old clusters and add merged one
      clusters = clusters.filter((_, index) => index !== cluster1Index && index !== cluster2Index);
      clusters.push(mergedCluster);
    }

    return clusters.filter(cluster => cluster.size >= options.min_cluster_size);
  }

  /**
   * DBSCAN clustering implementation
   */
  static async performDBSCANClustering(
    requirements: ProcessedRequirement[],
    options: ClusteringOptions
  ): Promise<ClusterInfo[]> {
    const eps = 1 - options.min_similarity; // Convert similarity to distance
    const minPts = options.min_cluster_size;
    
    const visited = new Set<string>();
    const clusters: ClusterInfo[] = [];
    let clusterIndex = 0;

    for (const requirement of requirements) {
      if (visited.has(requirement.id)) continue;
      
      visited.add(requirement.id);
      const neighbors = await ClusteringUtils.findNeighbors(requirement, requirements, eps);
      
      if (neighbors.length < minPts) {
        // Mark as noise (could be handled differently)
        continue;
      }
      
      // Create new cluster
      const cluster = ClusteringUtils.createDBSCANCluster(requirement, neighbors, clusterIndex++);
      const queue = [...neighbors];
      
      // Expand cluster
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (!visited.has(current.id)) {
          visited.add(current.id);
          const currentNeighbors = await ClusteringUtils.findNeighbors(current, requirements, eps);
          
          if (currentNeighbors.length >= minPts) {
            queue.push(...currentNeighbors.filter(n => !visited.has(n.id)));
          }
        }
        
        // Add to cluster if not already in any cluster
        if (!clusters.some(c => c.members.includes(current.id))) {
          cluster.members.push(current.id);
          cluster.size++;
        }
      }
      
      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Utility methods
   */
  private static initializeRandomCentroids(requirements: ProcessedRequirement[], k: number): ProcessedRequirement[] {
    const shuffled = [...requirements].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k);
  }

  private static assignToCentroids(
    requirements: ProcessedRequirement[],
    centroids: ProcessedRequirement[]
  ): Map<number, ProcessedRequirement[]> {
    const assignments = new Map<number, ProcessedRequirement[]>();
    
    // Initialize assignment groups
    for (let i = 0; i < centroids.length; i++) {
      assignments.set(i, []);
    }
    
    // Assign each requirement to closest centroid
    requirements.forEach(req => {
      let closestCentroid = 0;
      let maxSimilarity = -1;
      
      centroids.forEach((centroid, index) => {
        const similarity = ClusteringUtils.cosineSimilarity(req.vector, centroid.vector);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          closestCentroid = index;
        }
      });
      
      assignments.get(closestCentroid)!.push(req);
    });
    
    return assignments;
  }

  private static createClustersFromAssignments(
    assignments: Map<number, ProcessedRequirement[]>,
    requirements: ProcessedRequirement[]
  ): ClusterInfo[] {
    const clusters: ClusterInfo[] = [];
    
    assignments.forEach((members, index) => {
      if (members.length > 0) {
        clusters.push({
          cluster_id: `k_${index}`,
          size: members.length,
          centroid: members[0], // Will be updated
          members: members.map(m => m.id),
          quality_score: 0, // Will be calculated later
          dominant_concepts: []
        });
      }
    });
    
    return clusters;
  }

  private static updateCentroids(clusters: ClusterInfo[], requirements: ProcessedRequirement[]): ProcessedRequirement[] {
    return clusters.map(cluster => {
      const members = requirements.filter(req => cluster.members.includes(req.id));
      
      if (members.length === 0) return cluster.centroid;
      
      // Calculate average vector as new centroid
      const avgVector = new Array(members[0].vector.length).fill(0);
      members.forEach(member => {
        member.vector.forEach((value, index) => {
          avgVector[index] += value;
        });
      });
      
      avgVector.forEach((_, index) => {
        avgVector[index] /= members.length;
      });
      
      // Create synthetic centroid requirement
      return {
        ...cluster.centroid,
        vector: avgVector
      };
    });
  }

  private static checkCentroidConvergence(
    oldCentroids: ProcessedRequirement[],
    newCentroids: ProcessedRequirement[]
  ): boolean {
    const threshold = 0.01;
    
    for (let i = 0; i < oldCentroids.length; i++) {
      const similarity = ClusteringUtils.cosineSimilarity(oldCentroids[i].vector, newCentroids[i].vector);
      if (1 - similarity > threshold) return false;
    }
    
    return true;
  }

  private static async createDistanceMatrix(requirements: ProcessedRequirement[]): Promise<number[][]> {
    const matrix: number[][] = [];
    
    for (let i = 0; i < requirements.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < requirements.length; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          const similarity = ClusteringUtils.cosineSimilarity(requirements[i].vector, requirements[j].vector);
          matrix[i][j] = 1 - similarity; // Convert to distance
        }
      }
    }
    
    return matrix;
  }

  private static findClosestClusters(
    clusters: ClusterInfo[],
    distanceMatrix: number[][],
    requirements: ProcessedRequirement[]
  ): { cluster1Index: number; cluster2Index: number; similarity: number } {
    let maxSimilarity = -1;
    let cluster1Index = 0;
    let cluster2Index = 1;
    
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const similarity = ClusteringUtils.calculateClusterSimilarity(clusters[i], clusters[j], requirements);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          cluster1Index = i;
          cluster2Index = j;
        }
      }
    }
    
    return { cluster1Index, cluster2Index, similarity: maxSimilarity };
  }

  private static calculateClusterSimilarity(
    cluster1: ClusterInfo,
    cluster2: ClusterInfo,
    requirements: ProcessedRequirement[]
  ): number {
    // Average linkage method
    const members1 = requirements.filter(req => cluster1.members.includes(req.id));
    const members2 = requirements.filter(req => cluster2.members.includes(req.id));
    
    let totalSimilarity = 0;
    let count = 0;
    
    members1.forEach(m1 => {
      members2.forEach(m2 => {
        totalSimilarity += ClusteringUtils.cosineSimilarity(m1.vector, m2.vector);
        count++;
      });
    });
    
    return count > 0 ? totalSimilarity / count : 0;
  }

  private static mergeClusters(
    cluster1: ClusterInfo,
    cluster2: ClusterInfo,
    requirements: ProcessedRequirement[]
  ): ClusterInfo {
    const mergedMembers = [...cluster1.members, ...cluster2.members];
    const members = requirements.filter(req => mergedMembers.includes(req.id));
    
    return {
      cluster_id: `merged_${cluster1.cluster_id}_${cluster2.cluster_id}`,
      size: mergedMembers.length,
      centroid: members[0], // Will be recalculated
      members: mergedMembers,
      quality_score: 0, // Will be recalculated
      dominant_concepts: [...cluster1.dominant_concepts, ...cluster2.dominant_concepts]
    };
  }

  private static async findNeighbors(
    requirement: ProcessedRequirement,
    requirements: ProcessedRequirement[],
    eps: number
  ): Promise<ProcessedRequirement[]> {
    const neighbors: ProcessedRequirement[] = [];
    
    for (const other of requirements) {
      if (other.id !== requirement.id) {
        const similarity = ClusteringUtils.cosineSimilarity(requirement.vector, other.vector);
        const distance = 1 - similarity;
        
        if (distance <= eps) {
          neighbors.push(other);
        }
      }
    }
    
    return neighbors;
  }

  private static createDBSCANCluster(
    core: ProcessedRequirement,
    neighbors: ProcessedRequirement[],
    index: number
  ): ClusterInfo {
    return {
      cluster_id: `dbscan_${index}`,
      size: neighbors.length + 1,
      centroid: core,
      members: [core.id, ...neighbors.map(n => n.id)],
      quality_score: 0,
      dominant_concepts: core.keywords.slice(0, 5)
    };
  }

  private static cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Quality scoring methods
   */
  static calculateInternalSimilarity(members: ProcessedRequirement[]): number {
    if (members.length < 2) return 1;
    
    let totalSimilarity = 0;
    let count = 0;
    
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        totalSimilarity += ClusteringUtils.cosineSimilarity(members[i].vector, members[j].vector);
        count++;
      }
    }
    
    return count > 0 ? totalSimilarity / count : 0;
  }

  static calculateExternalSeparation(
    cluster: ClusterInfo,
    allClusters: ClusterInfo[],
    requirements: ProcessedRequirement[]
  ): number {
    const clusterMembers = requirements.filter(req => cluster.members.includes(req.id));
    const otherMembers = requirements.filter(req => !cluster.members.includes(req.id));
    
    if (otherMembers.length === 0) return 0;
    
    let totalSimilarity = 0;
    let count = 0;
    
    clusterMembers.forEach(member => {
      otherMembers.forEach(other => {
        totalSimilarity += ClusteringUtils.cosineSimilarity(member.vector, other.vector);
        count++;
      });
    });
    
    return count > 0 ? totalSimilarity / count : 0;
  }

  static extractDominantConcepts(members: ProcessedRequirement[]): string[] {
    const conceptCount = new Map<string, number>();
    
    members.forEach(member => {
      member.keywords.forEach(keyword => {
        conceptCount.set(keyword, (conceptCount.get(keyword) || 0) + 1);
      });
    });
    
    return Array.from(conceptCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([concept]) => concept);
  }
}