import { securityService } from './SecurityService';

export interface EncryptionConfig {
  algorithm: 'AES-GCM' | 'AES-CBC' | 'ChaCha20-Poly1305';
  keyLength: 256 | 128;
  ivLength?: number;
  tagLength?: number;
}

export interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag?: string;
  algorithm: string;
  keyId?: string;
}

export interface DecryptionResult {
  decryptedData: string;
  verified: boolean;
}

export interface KeyRotationConfig {
  rotationInterval: number; // milliseconds
  retentionCount: number; // number of old keys to retain
  autoRotate: boolean;
}

export interface EncryptionKey {
  id: string;
  key: CryptoKey;
  algorithm: string;
  created: Date;
  expires?: Date;
  status: 'active' | 'deprecated' | 'revoked';
}

/**
 * Comprehensive Data Encryption Service
 * Implements enterprise-grade encryption with key rotation and secure key management
 */
export class DataEncryption {
  private static instance: DataEncryption;
  private encryptionKeys = new Map<string, EncryptionKey>();
  private activeKeyId: string | null = null;
  private config: EncryptionConfig;
  private rotationConfig: KeyRotationConfig;

  private constructor() {
    this.config = {
      algorithm: 'AES-GCM',
      keyLength: 256,
      ivLength: 12, // 96 bits for GCM
      tagLength: 16, // 128 bits for GCM
    };

    this.rotationConfig = {
      rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
      retentionCount: 3, // Keep 3 old keys
      autoRotate: true,
    };

    this.initialize();
  }

  public static getInstance(): DataEncryption {
    if (!DataEncryption.instance) {
      DataEncryption.instance = new DataEncryption();
    }
    return DataEncryption.instance;
  }

  /**
   * Initialize encryption service
   */
  private async initialize(): Promise<void> {
    try {
      // Generate initial encryption key
      await this.generateNewKey();

      // Set up automatic key rotation
      if (this.rotationConfig.autoRotate) {
        setInterval(
          () => this.rotateKeys(),
          this.rotationConfig.rotationInterval
        );
      }

      // Log initialization
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'encryption_service_initialized',
          algorithm: this.config.algorithm,
          keyLength: this.config.keyLength,
        },
        timestamp: new Date(),
        severity: 'low',
      });
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw error;
    }
  }

  /**
   * Generate a new encryption key
   */
  private async generateNewKey(): Promise<string> {
    try {
      const keyId = this.generateKeyId();
      const key = await crypto.subtle.generateKey(
        {
          name: this.config.algorithm,
          length: this.config.keyLength,
        },
        false, // not extractable
        ['encrypt', 'decrypt']
      );

      const encryptionKey: EncryptionKey = {
        id: keyId,
        key,
        algorithm: this.config.algorithm,
        created: new Date(),
        status: 'active',
      };

      // Deprecate current active key if exists
      if (this.activeKeyId) {
        const currentKey = this.encryptionKeys.get(this.activeKeyId);
        if (currentKey) {
          currentKey.status = 'deprecated';
        }
      }

      this.encryptionKeys.set(keyId, encryptionKey);
      this.activeKeyId = keyId;

      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'encryption_key_generated',
          keyId,
          algorithm: this.config.algorithm,
        },
        timestamp: new Date(),
        severity: 'low',
      });

      return keyId;
    } catch (error) {
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'encryption_key_generation_failed',
          error: error.message,
        },
        timestamp: new Date(),
        severity: 'high',
      });
      throw error;
    }
  }

  /**
   * Encrypt sensitive data
   */
  public async encryptData(
    data: string,
    keyId?: string,
    additionalData?: string
  ): Promise<EncryptionResult> {
    try {
      const useKeyId = keyId || this.activeKeyId;
      if (!useKeyId) {
        throw new Error('No encryption key available');
      }

      const encryptionKey = this.encryptionKeys.get(useKeyId);
      if (!encryptionKey || encryptionKey.status === 'revoked') {
        throw new Error('Invalid or revoked encryption key');
      }

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength || 12));
      
      // Encode data
      const encodedData = new TextEncoder().encode(data);
      
      // Prepare encryption parameters
      const encryptParams: AesGcmParams = {
        name: this.config.algorithm,
        iv: iv,
      };

      // Add additional authenticated data if provided
      if (additionalData) {
        encryptParams.additionalData = new TextEncoder().encode(additionalData);
      }

      // Encrypt data
      const encryptedBuffer = await crypto.subtle.encrypt(
        encryptParams,
        encryptionKey.key,
        encodedData
      );

      // For GCM mode, extract the tag from the end of the encrypted data
      let encryptedData: ArrayBuffer;
      let tag: Uint8Array | undefined;

      if (this.config.algorithm === 'AES-GCM') {
        const tagLength = this.config.tagLength || 16;
        encryptedData = encryptedBuffer.slice(0, -tagLength);
        tag = new Uint8Array(encryptedBuffer.slice(-tagLength));
      } else {
        encryptedData = encryptedBuffer;
      }

      // Convert to base64 for storage
      const result: EncryptionResult = {
        encryptedData: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        algorithm: this.config.algorithm,
        keyId: useKeyId,
      };

      if (tag) {
        result.tag = this.arrayBufferToBase64(tag);
      }

      return result;
    } catch (error) {
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'encryption_failed',
          error: error.message,
          keyId: keyId || this.activeKeyId,
        },
        timestamp: new Date(),
        severity: 'high',
      });
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  public async decryptData(
    encryptionResult: EncryptionResult,
    additionalData?: string
  ): Promise<DecryptionResult> {
    try {
      const { encryptedData, iv, tag, keyId, algorithm } = encryptionResult;

      if (!keyId) {
        throw new Error('Key ID is required for decryption');
      }

      const encryptionKey = this.encryptionKeys.get(keyId);
      if (!encryptionKey) {
        throw new Error('Decryption key not found');
      }

      // Convert from base64
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      const ivBuffer = this.base64ToArrayBuffer(iv);

      // Prepare decryption parameters
      const decryptParams: AesGcmParams = {
        name: algorithm,
        iv: ivBuffer,
      };

      // Add additional authenticated data if provided
      if (additionalData) {
        decryptParams.additionalData = new TextEncoder().encode(additionalData);
      }

      // For GCM mode, combine encrypted data with tag
      let dataToDecrypt: ArrayBuffer;
      if (algorithm === 'AES-GCM' && tag) {
        const tagBuffer = this.base64ToArrayBuffer(tag);
        dataToDecrypt = this.concatenateArrayBuffers(encryptedBuffer, tagBuffer);
      } else {
        dataToDecrypt = encryptedBuffer;
      }

      // Decrypt data
      const decryptedBuffer = await crypto.subtle.decrypt(
        decryptParams,
        encryptionKey.key,
        dataToDecrypt
      );

      // Decode to string
      const decryptedData = new TextDecoder().decode(decryptedBuffer);

      return {
        decryptedData,
        verified: true,
      };
    } catch (error) {
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'decryption_failed',
          error: error.message,
          keyId: encryptionResult.keyId,
        },
        timestamp: new Date(),
        severity: 'high',
      });

      return {
        decryptedData: '',
        verified: false,
      };
    }
  }

  /**
   * Encrypt object with automatic serialization
   */
  public async encryptObject<T>(
    obj: T,
    keyId?: string,
    additionalData?: string
  ): Promise<EncryptionResult> {
    const serialized = JSON.stringify(obj);
    return this.encryptData(serialized, keyId, additionalData);
  }

  /**
   * Decrypt object with automatic deserialization
   */
  public async decryptObject<T>(
    encryptionResult: EncryptionResult,
    additionalData?: string
  ): Promise<{ data: T | null; verified: boolean }> {
    const result = await this.decryptData(encryptionResult, additionalData);
    
    if (!result.verified) {
      return { data: null, verified: false };
    }

    try {
      const data = JSON.parse(result.decryptedData) as T;
      return { data, verified: true };
    } catch (error) {
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'object_deserialization_failed',
          error: error.message,
        },
        timestamp: new Date(),
        severity: 'medium',
      });
      return { data: null, verified: false };
    }
  }

  /**
   * Rotate encryption keys
   */
  public async rotateKeys(): Promise<string> {
    try {
      // Generate new key
      const newKeyId = await this.generateNewKey();

      // Clean up old keys based on retention policy
      await this.cleanupOldKeys();

      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'encryption_keys_rotated',
          newKeyId,
          totalKeys: this.encryptionKeys.size,
        },
        timestamp: new Date(),
        severity: 'low',
      });

      return newKeyId;
    } catch (error) {
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'key_rotation_failed',
          error: error.message,
        },
        timestamp: new Date(),
        severity: 'high',
      });
      throw error;
    }
  }

  /**
   * Revoke a specific key
   */
  public async revokeKey(keyId: string, reason?: string): Promise<boolean> {
    const key = this.encryptionKeys.get(keyId);
    if (!key) {
      return false;
    }

    key.status = 'revoked';
    
    // If this was the active key, generate a new one
    if (keyId === this.activeKeyId) {
      await this.generateNewKey();
    }

    await securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'encryption_key_revoked',
        keyId,
        reason,
      },
      timestamp: new Date(),
      severity: 'medium',
    });

    return true;
  }

  /**
   * Clean up old keys based on retention policy
   */
  private async cleanupOldKeys(): Promise<void> {
    const sortedKeys = Array.from(this.encryptionKeys.values())
      .filter(key => key.status === 'deprecated')
      .sort((a, b) => b.created.getTime() - a.created.getTime());

    const keysToRemove = sortedKeys.slice(this.rotationConfig.retentionCount);
    
    for (const key of keysToRemove) {
      this.encryptionKeys.delete(key.id);
    }

    if (keysToRemove.length > 0) {
      await securityService.logSecurityEvent({
        type: 'security_configuration_change',
        details: {
          action: 'old_keys_cleaned_up',
          removedCount: keysToRemove.length,
          removedKeyIds: keysToRemove.map(k => k.id),
        },
        timestamp: new Date(),
        severity: 'low',
      });
    }
  }

  /**
   * Generate hash for data integrity verification
   */
  public async generateHash(data: string, algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm, encodedData);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Verify data integrity with hash
   */
  public async verifyHash(data: string, hash: string, algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<boolean> {
    const computedHash = await this.generateHash(data, algorithm);
    return computedHash === hash;
  }

  /**
   * Encrypt file data
   */
  public async encryptFile(file: File, keyId?: string): Promise<EncryptionResult & { originalName: string; originalSize: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = this.arrayBufferToBase64(arrayBuffer);
    
    const encryptionResult = await this.encryptData(base64Data, keyId, file.name);
    
    return {
      ...encryptionResult,
      originalName: file.name,
      originalSize: file.size,
    };
  }

  /**
   * Decrypt file data
   */
  public async decryptFile(
    encryptionResult: EncryptionResult & { originalName: string; originalSize: number }
  ): Promise<{ file: File | null; verified: boolean }> {
    const decryptionResult = await this.decryptData(encryptionResult, encryptionResult.originalName);
    
    if (!decryptionResult.verified) {
      return { file: null, verified: false };
    }

    try {
      const arrayBuffer = this.base64ToArrayBuffer(decryptionResult.decryptedData);
      const file = new File([arrayBuffer], encryptionResult.originalName);
      
      return { file, verified: true };
    } catch (error) {
      return { file: null, verified: false };
    }
  }

  /**
   * Get encryption statistics
   */
  public getEncryptionStats(): {
    totalKeys: number;
    activeKeys: number;
    deprecatedKeys: number;
    revokedKeys: number;
    activeKeyId: string | null;
    algorithm: string;
    keyLength: number;
  } {
    const keys = Array.from(this.encryptionKeys.values());
    
    return {
      totalKeys: keys.length,
      activeKeys: keys.filter(k => k.status === 'active').length,
      deprecatedKeys: keys.filter(k => k.status === 'deprecated').length,
      revokedKeys: keys.filter(k => k.status === 'revoked').length,
      activeKeyId: this.activeKeyId,
      algorithm: this.config.algorithm,
      keyLength: this.config.keyLength,
    };
  }

  /**
   * Update encryption configuration
   */
  public updateConfig(newConfig: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'encryption_config_updated',
        newConfig,
      },
      timestamp: new Date(),
      severity: 'low',
    });
  }

  /**
   * Update key rotation configuration
   */
  public updateRotationConfig(newConfig: Partial<KeyRotationConfig>): void {
    this.rotationConfig = { ...this.rotationConfig, ...newConfig };
    
    securityService.logSecurityEvent({
      type: 'security_configuration_change',
      details: {
        action: 'key_rotation_config_updated',
        newConfig,
      },
      timestamp: new Date(),
      severity: 'low',
    });
  }

  // Utility methods
  private generateKeyId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `key_${timestamp}_${random}`;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private concatenateArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    combined.set(new Uint8Array(buffer1), 0);
    combined.set(new Uint8Array(buffer2), buffer1.byteLength);
    return combined.buffer;
  }
}

// Utility functions for common encryption tasks
export const encryptSensitiveField = async (value: string): Promise<string> => {
  const encryption = DataEncryption.getInstance();
  const result = await encryption.encryptData(value);
  return JSON.stringify(result);
};

export const decryptSensitiveField = async (encryptedValue: string): Promise<string | null> => {
  try {
    const encryption = DataEncryption.getInstance();
    const encryptionResult = JSON.parse(encryptedValue) as EncryptionResult;
    const result = await encryption.decryptData(encryptionResult);
    return result.verified ? result.decryptedData : null;
  } catch (error) {
    return null;
  }
};

// Export singleton instance
export const dataEncryption = DataEncryption.getInstance();