import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

export type RequirementStatus = 'FULFILLED' | 'PARTIALLY_FULFILLED' | 'NOT_FULFILLED' | 'NOT_APPLICABLE';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Requirement {
  id?: string;
  name: string;
  description: string;
  category: string;
  status: RequirementStatus;
  priority: Priority;
  tags: string[];
  dueDate?: Date;
  assignedTo?: string;
  notes?: string;
  complianceScore: number;
  variables: Variable[];
  lastUpdated?: Date;
  createdAt?: Date;
}

export interface Variable {
  id?: string;
  name: string;
  value: string;
  requirementId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequirementHistory {
  id?: string;
  requirementId: string;
  status: RequirementStatus;
  comment?: string;
  updatedBy: string;
  createdAt: Date;
}

export const firebaseService = {
  // Test Firebase connection
  async testConnection() {
    try {
      console.log('Testing Firebase connection...');
      const testRef = collection(db, 'AuditreadyDatabase');
      const testDoc = await addDoc(testRef, {
        test: true,
        timestamp: serverTimestamp()
      });
      console.log('Test document created with ID:', testDoc.id);
      
      // Try to read it back
      const docSnap = await getDoc(doc(db, 'AuditreadyDatabase', testDoc.id));
      console.log('Test document exists:', docSnap.exists());
      console.log('Test document data:', docSnap.data());
      
      // Clean up
      await deleteDoc(doc(db, 'AuditreadyDatabase', testDoc.id));
      console.log('Test document deleted');
      
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  },

  // Requirements
  async getRequirements(): Promise<Requirement[]> {
    try {
      console.log('Fetching requirements...');
      const requirementsRef = collection(db, 'AuditreadyDatabase');
      const q = query(requirementsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const requirements = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const docData = doc.data();
          console.log('Raw document data:', docData);
          
          // Get variables from the correct path
          const variablesRef = collection(db, 'AuditreadyDatabase', doc.id, 'variables');
          const variablesSnapshot = await getDocs(variablesRef);
          const variables = variablesSnapshot.docs.map(variableDoc => ({
            id: variableDoc.id,
            ...variableDoc.data(),
            createdAt: variableDoc.data().createdAt?.toDate(),
            updatedAt: variableDoc.data().updatedAt?.toDate()
          })) as Variable[];
          
          console.log('Fetched variables for requirement:', doc.id, variables);
          
          // Convert string values to their correct types
          const status = String(docData.status || 'NOT_FULFILLED') as RequirementStatus;
          const complianceScore = parseInt(String(docData.complianceScore)) || 0;
          
          // Ensure compliance score matches status
          let correctedComplianceScore = complianceScore;
          if (status === 'FULFILLED' && complianceScore !== 100) {
            correctedComplianceScore = 100;
          } else if (status === 'PARTIALLY_FULFILLED' && complianceScore !== 50) {
            correctedComplianceScore = 50;
          } else if (status === 'NOT_FULFILLED' && complianceScore !== 0) {
            correctedComplianceScore = 0;
          } else if (status === 'NOT_APPLICABLE' && complianceScore !== -1) {
            correctedComplianceScore = -1;
          }
          
          const formattedData = {
            id: doc.id,
            name: String(docData.name || ''),
            description: String(docData.description || ''),
            category: String(docData.category || ''),
            status,
            priority: String(docData.priority || 'MEDIUM') as Priority,
            tags: Array.isArray(docData.tags) ? docData.tags.map(String) : [],
            assignedTo: String(docData.assignedTo || ''),
            complianceScore: correctedComplianceScore,
            lastUpdated: docData.lastUpdated ? new Date(docData.lastUpdated) : new Date(),
            createdAt: docData.createdAt ? new Date(docData.createdAt) : new Date(),
            variables
          };
          
          console.log('Formatted requirement data:', formattedData);
          return formattedData as Requirement;
        })
      );
      
      console.log('All requirements fetched and formatted:', requirements);
      return requirements;
    } catch (error) {
      console.error('Error fetching requirements:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },

  async createRequirement(data: Omit<Requirement, 'id' | 'lastUpdated' | 'createdAt' | 'variables'>) {
    try {
      console.log('Creating requirement with data:', data);
      const requirementsRef = collection(db, 'AuditreadyDatabase');
      
      // Format the data for Firebase with proper types
      const firebaseData = {
        name: String(data.name || ''),
        description: String(data.description || ''),
        category: String(data.category || ''),
        status: String(data.status || 'NOT_FULFILLED'),
        priority: String(data.priority || 'MEDIUM'),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        assignedTo: String(data.assignedTo || ''),
        complianceScore: String(0), // Store as string in Firebase
        lastUpdated: new Date().toISOString(), // Store as ISO string
        createdAt: new Date().toISOString() // Store as ISO string
      };

      console.log('Formatted data for Firebase:', firebaseData);
      
      const docRef = await addDoc(requirementsRef, firebaseData);
      console.log('Created requirement with ID:', docRef.id);
      
      // Return the created requirement with the correct types
      return {
        id: docRef.id,
        name: firebaseData.name,
        description: firebaseData.description,
        category: firebaseData.category,
        status: firebaseData.status as RequirementStatus,
        priority: firebaseData.priority as Priority,
        tags: firebaseData.tags,
        assignedTo: firebaseData.assignedTo,
        complianceScore: parseInt(firebaseData.complianceScore),
        lastUpdated: new Date(firebaseData.lastUpdated),
        createdAt: new Date(firebaseData.createdAt),
        variables: []
      } as Requirement;
    } catch (error) {
      console.error('Error creating requirement:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },

  async updateRequirementStatus(id: string, status: RequirementStatus) {
    try {
      console.log('Starting status update for requirement:', id);
      console.log('New status:', status);
      
      const requirementRef = doc(db, 'AuditreadyDatabase', id);
      console.log('Document reference created:', requirementRef.path);
      
      // First verify the document exists and get current data
      const docSnap = await getDoc(requirementRef);
      console.log('Document exists:', docSnap.exists());
      
      if (!docSnap.exists()) {
        console.error('Requirement document not found:', id);
        throw new Error('Requirement not found');
      }

      const currentData = docSnap.data();
      console.log('Current document data:', currentData);

      // Calculate new compliance score based on status using direct numeric values
      let complianceScore: number;
      switch (status) {
        case 'FULFILLED':
          complianceScore = 100;
          break;
        case 'PARTIALLY_FULFILLED':
          complianceScore = 50;
          break;
        case 'NOT_FULFILLED':
          complianceScore = 0;
          break;
        case 'NOT_APPLICABLE':
          complianceScore = -1; // Use -1 to distinguish from NOT_FULFILLED
          break;
        default:
          complianceScore = 0;
      }
      console.log('Calculated compliance score:', complianceScore);

      // Update the document with all required fields
      const updateData = {
        ...currentData,
        status,
        complianceScore: String(complianceScore), // Store as string in Firebase
        lastUpdated: new Date().toISOString()
      };
      console.log('Update data:', updateData);
      
      // Perform the update
      await updateDoc(requirementRef, updateData);
      console.log('Document updated successfully');

      // Verify the update
      const updatedDoc = await getDoc(requirementRef);
      const updatedData = updatedDoc.data();
      console.log('Verified updated document data:', updatedData);
      
      if (updatedData?.status !== status) {
        console.error('Status update verification failed');
        throw new Error('Status update verification failed');
      }

      // Add to history
      const historyRef = collection(db, 'AuditreadyDatabase', id, 'history');
      const historyData = {
        status,
        updatedBy: 'system',
        createdAt: new Date().toISOString()
      };
      console.log('Adding to history:', historyData);
      
      await addDoc(historyRef, historyData);
      console.log('History entry added successfully');

      // Get variables for the requirement
      const variablesRef = collection(db, 'AuditreadyDatabase', id, 'variables');
      const variablesSnapshot = await getDocs(variablesRef);
      const variables = variablesSnapshot.docs.map(variableDoc => ({
        id: variableDoc.id,
        ...variableDoc.data(),
        createdAt: variableDoc.data().createdAt?.toDate(),
        updatedAt: variableDoc.data().updatedAt?.toDate()
      })) as Variable[];
      
      // Return the updated requirement
      const result = {
        id: id,
        ...updatedData,
        lastUpdated: new Date(updatedData?.lastUpdated),
        createdAt: new Date(updatedData?.createdAt),
        variables
      } as Requirement;
      
      console.log('Returning updated requirement:', result);
      return result;
    } catch (error) {
      console.error('Detailed error in updateRequirementStatus:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  },

  // Variables
  async getVariables(requirementId: string) {
    try {
      console.log('Fetching variables for requirement:', requirementId);
      const variablesRef = collection(db, 'AuditreadyDatabase', requirementId, 'variables');
      const snapshot = await getDocs(variablesRef);
      const variables = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Variable[];
      console.log('Fetched variables:', variables);
      return variables;
    } catch (error) {
      console.error('Error fetching variables:', error);
      throw error;
    }
  },

  async updateVariable(requirementId: string, variableId: string, value: string) {
    try {
      console.log('Updating variable:', { requirementId, variableId, value });
      const variableRef = doc(db, 'AuditreadyDatabase', requirementId, 'variables', variableId);
      await updateDoc(variableRef, {
        value,
        updatedAt: serverTimestamp()
      });
      console.log('Variable updated successfully');
    } catch (error) {
      console.error('Error updating variable:', error);
      throw error;
    }
  },

  async createVariable(requirementId: string, data: Omit<Variable, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      console.log('Creating variable:', data);
      const variablesRef = collection(db, 'AuditreadyDatabase', requirementId, 'variables');
      const docRef = await addDoc(variablesRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Created variable with ID:', docRef.id);
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating variable:', error);
      throw error;
    }
  },

  // History
  async getRequirementHistory(requirementId: string) {
    try {
      console.log('Fetching history for requirement:', requirementId);
      const historyRef = collection(db, 'AuditreadyDatabase', requirementId, 'history');
      const q = query(
        historyRef,
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as RequirementHistory[];
      console.log('Fetched history:', history);
      return history;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }
}; 