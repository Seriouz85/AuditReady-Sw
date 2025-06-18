import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardCard } from "@/components/standards/StandardCard";
import { StandardsLibrary } from "@/components/standards/StandardsLibrary";
import { Standard, StandardType } from "@/types";
import { Plus, Search, Filter, ClipboardCheck, Library } from "lucide-react";
import { toast } from "@/utils/toast";
import { CreateStandardForm } from "@/components/standards/CreateStandardForm";
import { useRequirements } from "@/hooks/useRequirements";
import SoAPreview from '@/components/soa/SoAPreview';
import { useStandardsService, StandardWithRequirements } from "@/services/standards/StandardsService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the complete library of available standards (used for demo mode)
export const standardsLibrary: Standard[] = [
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001',
    version: '2022',
    type: 'framework' as StandardType,
    description: 'Information Security Management System standard that provides requirements for an information security management system.',
    category: 'Information Security',
    requirements: [
      'iso-27001-4.1', 'iso-27001-4.2', 'iso-27001-4.3', 'iso-27001-4.4',
      'iso-27001-5.1', 'iso-27001-5.2', 'iso-27001-5.3',
      'iso-27001-6.1.1', 'iso-27001-6.1.2', 'iso-27001-6.1.3', 'iso-27001-6.2', 'iso-27001-6.3',
      'iso-27001-7.1', 'iso-27001-7.2', 'iso-27001-7.3', 'iso-27001-7.4', 'iso-27001-7.5.1', 'iso-27001-7.5.2', 'iso-27001-7.5.3',
      'iso-27001-8.1', 'iso-27001-8.2', 'iso-27001-8.3',
      'iso-27001-9.1', 'iso-27001-9.2.1', 'iso-27001-9.2.2', 'iso-27001-9.3.1', 'iso-27001-9.3.2', 'iso-27001-9.3.3',
      'iso-27001-10.1', 'iso-27001-10.2'
    ],
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-03-10T12:00:00Z',
  },
  {
    id: 'iso-27002-2022',
    name: 'ISO 27002:2022',
    version: '2022',
    type: 'framework' as StandardType,
    description: 'Code of practice for information security controls that provides guidance on implementing information security controls.',
    category: 'Information Security',
    requirements: [
      // A.5 Organizational controls (37)
      'iso-27002-A5.1', 'iso-27002-A5.2', 'iso-27002-A5.3', 'iso-27002-A5.4', 'iso-27002-A5.5', 'iso-27002-A5.6', 
      'iso-27002-A5.7', 'iso-27002-A5.8', 'iso-27002-A5.9', 'iso-27002-A5.10', 'iso-27002-A5.11', 'iso-27002-A5.12', 
      'iso-27002-A5.13', 'iso-27002-A5.14', 'iso-27002-A5.15', 'iso-27002-A5.16', 'iso-27002-A5.17', 'iso-27002-A5.18', 
      'iso-27002-A5.19', 'iso-27002-A5.20', 'iso-27002-A5.21', 'iso-27002-A5.22', 'iso-27002-A5.23', 'iso-27002-A5.24', 
      'iso-27002-A5.25', 'iso-27002-A5.26', 'iso-27002-A5.27', 'iso-27002-A5.28', 'iso-27002-A5.29', 'iso-27002-A5.30', 
      'iso-27002-A5.31', 'iso-27002-A5.32', 'iso-27002-A5.33', 'iso-27002-A5.34', 'iso-27002-A5.35', 'iso-27002-A5.36', 
      'iso-27002-A5.37',
      // A.6 People controls (8)
      'iso-27002-A6.1', 'iso-27002-A6.2', 'iso-27002-A6.3', 'iso-27002-A6.4', 'iso-27002-A6.5', 'iso-27002-A6.6', 
      'iso-27002-A6.7', 'iso-27002-A6.8',
      // A.7 Physical controls (14)
      'iso-27002-A7.1', 'iso-27002-A7.2', 'iso-27002-A7.3', 'iso-27002-A7.4', 'iso-27002-A7.5', 'iso-27002-A7.6', 
      'iso-27002-A7.7', 'iso-27002-A7.8', 'iso-27002-A7.9', 'iso-27002-A7.10', 'iso-27002-A7.11', 'iso-27002-A7.12', 
      'iso-27002-A7.13', 'iso-27002-A7.14',
      // A.8 Technological controls (34)
      'iso-27002-A8.1', 'iso-27002-A8.2', 'iso-27002-A8.3', 'iso-27002-A8.4', 'iso-27002-A8.5', 'iso-27002-A8.6', 
      'iso-27002-A8.7', 'iso-27002-A8.8', 'iso-27002-A8.9', 'iso-27002-A8.10', 'iso-27002-A8.11', 'iso-27002-A8.12', 
      'iso-27002-A8.13', 'iso-27002-A8.14', 'iso-27002-A8.15', 'iso-27002-A8.16', 'iso-27002-A8.17', 'iso-27002-A8.18', 
      'iso-27002-A8.19', 'iso-27002-A8.20', 'iso-27002-A8.21', 'iso-27002-A8.22', 'iso-27002-A8.23', 'iso-27002-A8.24', 
      'iso-27002-A8.25', 'iso-27002-A8.26', 'iso-27002-A8.27', 'iso-27002-A8.28', 'iso-27002-A8.29', 'iso-27002-A8.30', 
      'iso-27002-A8.31', 'iso-27002-A8.32', 'iso-27002-A8.33', 'iso-27002-A8.34'
    ],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2',
    name: 'NIS2 Directive',
    version: '2022',
    type: 'regulation' as StandardType,
    description: 'EU directive on measures for a high common level of cybersecurity across the Union.',
    category: 'Network Security',
    requirements: [
      'nis2-A1', 'nis2-A2', 'nis2-A3', 'nis2-A4', 'nis2-A5', 
      'nis2-B1', 'nis2-B2', 'nis2-B3', 'nis2-B4', 
      'nis2-C1', 'nis2-C2', 'nis2-C3'
    ],
    createdAt: '2024-03-12T14:30:00Z',
    updatedAt: '2024-03-12T14:30:00Z',
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    version: '2018',
    type: 'regulation' as StandardType,
    description: 'General Data Protection Regulation for data protection and privacy in the EU.',
    category: 'Data Protection',
    requirements: [
      'gdpr-A1', 'gdpr-A2', 'gdpr-A3', 'gdpr-A4', 'gdpr-A5', 'gdpr-A6',
      'gdpr-B1', 'gdpr-B2', 'gdpr-B3', 'gdpr-B4', 'gdpr-B5',
      'gdpr-C1', 'gdpr-C2', 'gdpr-C3', 'gdpr-C4'
    ],
    createdAt: '2024-03-15T09:20:00Z',
    updatedAt: '2024-03-15T09:20:00Z',
  },
  {
    id: 'nist-csf-2.0',
    name: 'NIST Cybersecurity Framework 2.0',
    version: '2.0',
    type: 'framework' as StandardType,
    description: 'A voluntary framework consisting of standards, guidelines, and best practices to manage cybersecurity-related risk.',
    category: 'Cybersecurity',
    requirements: [
      'nist-csf-GV.1', 'nist-csf-GV.2', 'nist-csf-GV.3', 'nist-csf-GV.4', 'nist-csf-GV.5',
      'nist-csf-ID.1', 'nist-csf-ID.2', 'nist-csf-ID.3', 'nist-csf-ID.4', 'nist-csf-ID.5',
      'nist-csf-PR.1', 'nist-csf-PR.2', 'nist-csf-PR.3', 'nist-csf-PR.4', 'nist-csf-PR.5',
      'nist-csf-DE.1', 'nist-csf-DE.2', 'nist-csf-DE.3', 'nist-csf-DE.4', 'nist-csf-DE.5',
      'nist-csf-RS.1', 'nist-csf-RS.2', 'nist-csf-RS.3', 'nist-csf-RS.4', 'nist-csf-RS.5',
      'nist-csf-RC.1', 'nist-csf-RC.2', 'nist-csf-RC.3', 'nist-csf-RC.4', 'nist-csf-RC.5'
    ],
    createdAt: '2024-02-26T00:00:00Z',
    updatedAt: '2024-02-26T00:00:00Z',
  },
  {
    id: 'cis-ig1',
    name: 'CIS Controls IG1',
    version: '8.1',
    type: 'framework' as StandardType,
    description: 'CIS Implementation Group 1 (IG1) is the essential cyber hygiene standard, representing basic cyber defense readiness for all enterprises.',
    category: 'Cybersecurity',
    requirements: [
      'cis-ig1-1.1', 'cis-ig1-1.2',
      'cis-ig1-2.1', 'cis-ig1-2.2', 'cis-ig1-2.3',
      'cis-ig1-3.1', 'cis-ig1-3.2', 'cis-ig1-3.3', 'cis-ig1-3.4', 'cis-ig1-3.5', 'cis-ig1-3.6',
      'cis-ig1-4.1', 'cis-ig1-4.2', 'cis-ig1-4.3', 'cis-ig1-4.4', 'cis-ig1-4.5', 'cis-ig1-4.6', 'cis-ig1-4.7',
      'cis-ig1-5.1', 'cis-ig1-5.2', 'cis-ig1-5.3', 'cis-ig1-5.4',
      'cis-ig1-6.1', 'cis-ig1-6.2', 'cis-ig1-6.3', 'cis-ig1-6.4', 'cis-ig1-6.5',
      'cis-ig1-7.1', 'cis-ig1-7.2', 'cis-ig1-7.3', 'cis-ig1-7.4',
      'cis-ig1-8.1', 'cis-ig1-8.2', 'cis-ig1-8.3',
      'cis-ig1-9.1', 'cis-ig1-9.2',
      'cis-ig1-10.1', 'cis-ig1-10.2', 'cis-ig1-10.3',
      'cis-ig1-11.1', 'cis-ig1-11.2', 'cis-ig1-11.3', 'cis-ig1-11.4',
      'cis-ig1-12.1',
      'cis-ig1-13.1',
      'cis-ig1-14.1', 'cis-ig1-14.2', 'cis-ig1-14.3', 'cis-ig1-14.4', 'cis-ig1-14.5', 'cis-ig1-14.6', 'cis-ig1-14.7', 'cis-ig1-14.8',
      'cis-ig1-15.1',
      'cis-ig1-16.1',
      'cis-ig1-17.1', 'cis-ig1-17.2', 'cis-ig1-17.3'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cis-ig2',
    name: 'CIS Controls IG2',
    version: '8.1',
    type: 'framework' as StandardType,
    description: 'CIS Implementation Group 2 (IG2) includes all IG1 safeguards plus additional safeguards for organizations with moderate cybersecurity maturity and resources.',
    category: 'Cybersecurity',
    requirements: [
      'cis-ig2-1.1', 'cis-ig2-1.2', 'cis-ig2-1.3', 'cis-ig2-1.4',
      'cis-ig2-2.1', 'cis-ig2-2.2', 'cis-ig2-2.3', 'cis-ig2-2.4', 'cis-ig2-2.5', 'cis-ig2-2.6',
      'cis-ig2-3.1', 'cis-ig2-3.2', 'cis-ig2-3.3', 'cis-ig2-3.4', 'cis-ig2-3.5', 'cis-ig2-3.6', 'cis-ig2-3.7', 'cis-ig2-3.8', 'cis-ig2-3.9', 'cis-ig2-3.10', 'cis-ig2-3.11', 'cis-ig2-3.12',
      'cis-ig2-4.1', 'cis-ig2-4.2', 'cis-ig2-4.3', 'cis-ig2-4.4', 'cis-ig2-4.5', 'cis-ig2-4.6', 'cis-ig2-4.7', 'cis-ig2-4.8', 'cis-ig2-4.9', 'cis-ig2-4.10', 'cis-ig2-4.11',
      'cis-ig2-5.1', 'cis-ig2-5.2', 'cis-ig2-5.3', 'cis-ig2-5.4', 'cis-ig2-5.5', 'cis-ig2-5.6',
      'cis-ig2-6.1', 'cis-ig2-6.2', 'cis-ig2-6.3', 'cis-ig2-6.4', 'cis-ig2-6.5', 'cis-ig2-6.6', 'cis-ig2-6.7',
      'cis-ig2-7.1', 'cis-ig2-7.2', 'cis-ig2-7.3', 'cis-ig2-7.4', 'cis-ig2-7.5', 'cis-ig2-7.6', 'cis-ig2-7.7',
      'cis-ig2-8.1', 'cis-ig2-8.2', 'cis-ig2-8.3', 'cis-ig2-8.4', 'cis-ig2-8.5', 'cis-ig2-8.6', 'cis-ig2-8.7', 'cis-ig2-8.8', 'cis-ig2-8.9', 'cis-ig2-8.10', 'cis-ig2-8.11',
      'cis-ig2-9.1', 'cis-ig2-9.2', 'cis-ig2-9.3', 'cis-ig2-9.4', 'cis-ig2-9.5', 'cis-ig2-9.6',
      'cis-ig2-10.1', 'cis-ig2-10.2', 'cis-ig2-10.3', 'cis-ig2-10.4', 'cis-ig2-10.5', 'cis-ig2-10.6', 'cis-ig2-10.7',
      'cis-ig2-11.1', 'cis-ig2-11.2', 'cis-ig2-11.3', 'cis-ig2-11.4', 'cis-ig2-11.5',
      'cis-ig2-12.1', 'cis-ig2-12.2', 'cis-ig2-12.3', 'cis-ig2-12.4', 'cis-ig2-12.5', 'cis-ig2-12.6', 'cis-ig2-12.7',
      'cis-ig2-13.1', 'cis-ig2-13.2', 'cis-ig2-13.3', 'cis-ig2-13.4', 'cis-ig2-13.5', 'cis-ig2-13.6',
      'cis-ig2-14.1', 'cis-ig2-14.2', 'cis-ig2-14.3', 'cis-ig2-14.4', 'cis-ig2-14.5', 'cis-ig2-14.6', 'cis-ig2-14.7', 'cis-ig2-14.8',
      'cis-ig2-15.1', 'cis-ig2-15.2', 'cis-ig2-15.3', 'cis-ig2-15.4',
      'cis-ig2-16.1', 'cis-ig2-16.2', 'cis-ig2-16.3', 'cis-ig2-16.4', 'cis-ig2-16.5', 'cis-ig2-16.6', 'cis-ig2-16.7', 'cis-ig2-16.8', 'cis-ig2-16.9', 'cis-ig2-16.10', 'cis-ig2-16.11',
      'cis-ig2-17.1', 'cis-ig2-17.2', 'cis-ig2-17.3', 'cis-ig2-17.4', 'cis-ig2-17.5', 'cis-ig2-17.6', 'cis-ig2-17.7', 'cis-ig2-17.8'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cis-ig3',
    name: 'CIS Controls IG3',
    version: '8.1',
    type: 'framework' as StandardType,
    description: 'CIS Implementation Group 3 (IG3) includes all IG1 and IG2 safeguards plus additional advanced safeguards for organizations with the highest cybersecurity maturity.',
    category: 'Cybersecurity',
    requirements: [
      'cis-ig3-1.1', 'cis-ig3-1.2', 'cis-ig3-1.3', 'cis-ig3-1.4', 'cis-ig3-1.5',
      'cis-ig3-2.1', 'cis-ig3-2.2', 'cis-ig3-2.3', 'cis-ig3-2.4', 'cis-ig3-2.5', 'cis-ig3-2.6', 'cis-ig3-2.7',
      'cis-ig3-3.1', 'cis-ig3-3.2', 'cis-ig3-3.3', 'cis-ig3-3.4', 'cis-ig3-3.5', 'cis-ig3-3.6', 'cis-ig3-3.7', 'cis-ig3-3.8', 'cis-ig3-3.9', 'cis-ig3-3.10', 'cis-ig3-3.11', 'cis-ig3-3.12', 'cis-ig3-3.13', 'cis-ig3-3.14',
      'cis-ig3-4.1', 'cis-ig3-4.2', 'cis-ig3-4.3', 'cis-ig3-4.4', 'cis-ig3-4.5', 'cis-ig3-4.6', 'cis-ig3-4.7', 'cis-ig3-4.8', 'cis-ig3-4.9', 'cis-ig3-4.10', 'cis-ig3-4.11', 'cis-ig3-4.12',
      'cis-ig3-5.1', 'cis-ig3-5.2', 'cis-ig3-5.3', 'cis-ig3-5.4', 'cis-ig3-5.5', 'cis-ig3-5.6',
      'cis-ig3-6.1', 'cis-ig3-6.2', 'cis-ig3-6.3', 'cis-ig3-6.4', 'cis-ig3-6.5', 'cis-ig3-6.6', 'cis-ig3-6.7', 'cis-ig3-6.8',
      'cis-ig3-7.1', 'cis-ig3-7.2', 'cis-ig3-7.3', 'cis-ig3-7.4', 'cis-ig3-7.5', 'cis-ig3-7.6', 'cis-ig3-7.7',
      'cis-ig3-8.1', 'cis-ig3-8.2', 'cis-ig3-8.3', 'cis-ig3-8.4', 'cis-ig3-8.5', 'cis-ig3-8.6', 'cis-ig3-8.7', 'cis-ig3-8.8', 'cis-ig3-8.9', 'cis-ig3-8.10', 'cis-ig3-8.11', 'cis-ig3-8.12',
      'cis-ig3-9.1', 'cis-ig3-9.2', 'cis-ig3-9.3', 'cis-ig3-9.4', 'cis-ig3-9.5', 'cis-ig3-9.6', 'cis-ig3-9.7',
      'cis-ig3-10.1', 'cis-ig3-10.2', 'cis-ig3-10.3', 'cis-ig3-10.4', 'cis-ig3-10.5', 'cis-ig3-10.6', 'cis-ig3-10.7',
      'cis-ig3-11.1', 'cis-ig3-11.2', 'cis-ig3-11.3', 'cis-ig3-11.4', 'cis-ig3-11.5',
      'cis-ig3-12.1', 'cis-ig3-12.2', 'cis-ig3-12.3', 'cis-ig3-12.4', 'cis-ig3-12.5', 'cis-ig3-12.6', 'cis-ig3-12.7', 'cis-ig3-12.8',
      'cis-ig3-13.1', 'cis-ig3-13.2', 'cis-ig3-13.3', 'cis-ig3-13.4', 'cis-ig3-13.5', 'cis-ig3-13.6', 'cis-ig3-13.7', 'cis-ig3-13.8', 'cis-ig3-13.9', 'cis-ig3-13.10', 'cis-ig3-13.11',
      'cis-ig3-14.1', 'cis-ig3-14.2', 'cis-ig3-14.3', 'cis-ig3-14.4', 'cis-ig3-14.5', 'cis-ig3-14.6', 'cis-ig3-14.7', 'cis-ig3-14.8', 'cis-ig3-14.9',
      'cis-ig3-15.1', 'cis-ig3-15.2', 'cis-ig3-15.3', 'cis-ig3-15.4', 'cis-ig3-15.5', 'cis-ig3-15.6', 'cis-ig3-15.7',
      'cis-ig3-16.1', 'cis-ig3-16.2', 'cis-ig3-16.3', 'cis-ig3-16.4', 'cis-ig3-16.5', 'cis-ig3-16.6', 'cis-ig3-16.7', 'cis-ig3-16.8', 'cis-ig3-16.9', 'cis-ig3-16.10', 'cis-ig3-16.11', 'cis-ig3-16.12', 'cis-ig3-16.13', 'cis-ig3-16.14',
      'cis-ig3-17.1', 'cis-ig3-17.2', 'cis-ig3-17.3', 'cis-ig3-17.4', 'cis-ig3-17.5', 'cis-ig3-17.6', 'cis-ig3-17.7', 'cis-ig3-17.8', 'cis-ig3-17.9',
      'cis-ig3-18.1', 'cis-ig3-18.2', 'cis-ig3-18.3', 'cis-ig3-18.4', 'cis-ig3-18.5'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'iso-27005-2022',
    name: 'ISO/IEC 27005:2022',
    version: '2022',
    type: 'framework' as StandardType,
    description: 'Information security risk management standard that provides guidelines for information security risk management.',
    category: 'Risk Management',
    requirements: [
      'iso-27005-4.1', 'iso-27005-4.2', 'iso-27005-4.3', 'iso-27005-4.4',
      'iso-27005-5.1', 'iso-27005-5.2', 'iso-27005-5.3', 'iso-27005-5.4',
      'iso-27005-6.1', 'iso-27005-6.2', 'iso-27005-6.3', 'iso-27005-6.4',
      'iso-27005-7.1', 'iso-27005-7.2', 'iso-27005-7.3', 'iso-27005-7.4',
      'iso-27005-8.1', 'iso-27005-8.2', 'iso-27005-8.3', 'iso-27005-8.4'
    ],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  }
];

const Standards = () => {
  const { requirements: requirementsData, loading: requirementsLoading } = useRequirements();
  const { isDemo } = useAuth();
  const standardsService = useStandardsService();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab] = useState("all");
  const [localStandards, setLocalStandards] = useState<StandardWithRequirements[]>([]);
  const [availableStandards, setAvailableStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSOADialogOpen, setIsSOADialogOpen] = useState(false);
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLibraryStandards, setSelectedLibraryStandards] = useState<Record<string, boolean>>({});
  const soaRef = useRef(null);

  // Load standards data on component mount
  useEffect(() => {
    loadStandardsData();
  }, []);

  const loadStandardsData = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // Initialize demo data if not exists
        const savedStandards = localStorage.getItem('standards');
        if (!savedStandards) {
          const initialStandards = standardsLibrary.filter(std => 
            std.id !== 'nist-csf-2.0' && 
            std.id !== 'iso-27005-2022'
          );
          localStorage.setItem('standards', JSON.stringify(initialStandards));
          
          const initialApplicability: Record<string, boolean> = {};
          initialStandards.forEach(standard => {
            initialApplicability[standard.id] = true;
          });
          localStorage.setItem('applicableStandards', JSON.stringify(initialApplicability));
        }
        
        // Load demo standards
        const demoStandards = await standardsService.getStandards();
        setLocalStandards(demoStandards);
        setAvailableStandards(standardsLibrary);
      } else {
        // Load production standards
        const [orgStandards, availableStds] = await Promise.all([
          standardsService.getStandards(),
          standardsService.getAvailableStandards()
        ]);
        
        setLocalStandards(orgStandards);
        setAvailableStandards(availableStds);
      }
    } catch (error) {
      console.error('Error loading standards:', error);
      toast.error('Failed to load standards');
    } finally {
      setLoading(false);
    }
  };

  const getRequirementCount = (standardId: string) => {
    const standard = localStandards.find(std => std.id === standardId);
    return standard?.requirementCount || 0;
  };

  const handleApplicabilityChange = async (standardId: string, isApplicable: boolean) => {
    try {
      const result = await standardsService.updateApplicability(standardId, isApplicable);
      if (result.success) {
        // Update local state
        setLocalStandards(prev => prev.map(std => 
          std.id === standardId 
            ? { ...std, isApplicable }
            : std
        ));
        toast.success(`Standard marked as ${isApplicable ? 'applicable' : 'not applicable'}`);
      } else {
        toast.error(result.error || 'Failed to update standard applicability');
      }
    } catch (error) {
      console.error('Error updating applicability:', error);
      toast.error('Failed to update standard applicability');
    }
  };

  const handleRemoveStandard = async (standardId: string) => {
    try {
      const result = await standardsService.removeStandard(standardId);
      if (result.success) {
        // Update local state
        setLocalStandards(prev => prev.filter(std => std.id !== standardId));
        toast.success("Standard removed successfully");
      } else {
        toast.error(result.error || 'Failed to remove standard');
      }
    } catch (error) {
      console.error('Error removing standard:', error);
      toast.error('Failed to remove standard');
    }
  };

  const filteredStandards = localStandards.filter(standard => {
    const matchesSearch = standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || standard.type === filterType;
    const matchesTab = activeTab === "all" || 
      (activeTab === "applicable" && standard.isApplicable) ||
      (activeTab === "not-applicable" && !standard.isApplicable);
    return matchesSearch && matchesType && matchesTab;
  });

  const exportStandard = (id: string) => {
    toast.success(`Standard ${id} exported successfully`);
  };

  const handleAddStandards = async (newStandards: Standard[]) => {
    try {
      // Filter out standards that are already in the list
      const uniqueNewStandards = newStandards.filter(
        newStd => !localStandards.some(existingStd => existingStd.id === newStd.id)
      );

      if (uniqueNewStandards.length === 0) {
        toast.error("No new standards to add");
        return;
      }

      const standardIds = uniqueNewStandards.map(std => std.id);
      const result = await standardsService.addStandards(standardIds);
      
      if (result.success) {
        // Reload standards data to get the updated list
        await loadStandardsData();
        setIsLibraryDialogOpen(false);
        setSelectedLibraryStandards({});
        toast.success(`Added ${uniqueNewStandards.length} new standard(s)`);
      } else {
        toast.error(result.error || 'Failed to add standards');
      }
    } catch (error) {
      console.error('Error adding standards:', error);
      toast.error('Failed to add standards');
    }
  };

   const handleCreateStandard = (_: Standard) => {    // Implementation needed
  };

  if (requirementsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Standards & Regulations</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isSOADialogOpen} onOpenChange={setIsSOADialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Statement of Applicability</span>
                <span className="sm:hidden">SoA</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Statement of Applicability</DialogTitle>
                <DialogDescription>
                  Live preview of your Statement of Applicability (SoA) based on all applicable standards.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                <SoAPreview 
                  ref={soaRef}
                  standards={localStandards.filter(std => std.isApplicable)}
                  requirements={requirementsData}
                />
              </div>
              <div className="border-t pt-3 pb-2 flex justify-end gap-2">
                <SoAPreview.ActionButtons soaRef={soaRef} onClose={() => setIsSOADialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Library className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add from Library</span>
                <span className="sm:hidden">Library</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Standards Library</DialogTitle>
                <DialogDescription>
                  Select standards and frameworks to add to your organization's compliance scope.
                </DialogDescription>
              </DialogHeader>
              <StandardsLibrary
                availableStandards={availableStandards.filter(
                  std => !localStandards.some(vs => vs.id === std.id)
                )}
                selectedStandards={selectedLibraryStandards}
                onSelectionChange={(id, selected) => {
                  setSelectedLibraryStandards(prev => ({
                    ...prev,
                    [id]: selected
                  }));
                }}
                onAddStandards={() => {
                  const selectedStandards = availableStandards.filter(
                    std => selectedLibraryStandards[std.id]
                  );
                  handleAddStandards(selectedStandards);
                }}
                onClose={() => setIsLibraryDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Standard</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Standard</DialogTitle>
                <DialogDescription>
                  Define a new standard or framework for your organization.
                </DialogDescription>
              </DialogHeader>
              <CreateStandardForm onSubmit={handleCreateStandard} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search standards..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={filterType}
            onValueChange={(value) => setFilterType(value as string)}
          >
            <SelectTrigger className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="framework">Framework</SelectItem>
              <SelectItem value="regulation">Regulation</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="guideline">Guideline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Available Standards</h2>
        <p className="text-muted-foreground">
          Browse, filter, and manage your cybersecurity standards and regulations. Click on a standard to view its requirements.
        </p>
      </div>
      
      {filteredStandards.length > 0 ? (
        <div className="pb-6">
          <div className="space-y-4">
            {filteredStandards.map((standard) => (
              <div key={standard.id} className="pb-4">
                <StandardCard 
                  standard={standard}
                  requirementCount={getRequirementCount(standard.id)}
                  onExport={() => exportStandard(standard.id)}
                  isApplicable={standard.isApplicable}
                  onApplicabilityChange={(isApplicable) => handleApplicabilityChange(standard.id, isApplicable)}
                  onRemove={() => handleRemoveStandard(standard.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-background">
          <h3 className="text-lg font-medium">No standards found</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Adjust your search or add a new standard.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setFilterType("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Standards;
