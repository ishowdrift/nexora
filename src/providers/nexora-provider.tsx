'use client';

// ==============================================================================
// NEXORA MULTI-TENANT APPLICATION CONTEXT & REACT PROVIDER
// Provides reactive tenant state, live switching, and permission-checked mutations
// ==============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Organization,
  Profile,
  OrganizationMember,
  Project,
  Task,
  Asset,
  ActivityLog,
  OrganizationSubscription,
  OrganizationUsageStats,
  Invitation,
  MemberRole,
  SubscriptionPlan,
  Permission,
} from '@/types/database';
import { getNexoraStore } from '@/lib/store/nexora-store';
import { hasPermission as checkRolePermission, canPerformAction } from '@/lib/permissions';

interface NexoraContextType {
  currentOrg: Organization | null;
  currentUser: Profile | null;
  currentMemberRole: MemberRole | null;
  userOrganizations: { organization: Organization; role: MemberRole }[];
  projects: Project[];
  tasks: Task[];
  assets: Asset[];
  members: OrganizationMember[];
  activityLogs: ActivityLog[];
  subscription: OrganizationSubscription | null;
  usageStats: OrganizationUsageStats;
  invitations: Invitation[];
  allProfiles: Profile[];
  isLoading: boolean;
  
  // Navigation & Tenant Switching
  switchOrg: (orgId: string) => void;
  switchUser: (userId: string) => void;
  createOrganization: (name: string, domain?: string) => Organization;
  
  // Operational Mutations
  createProject: (data: Pick<Project, 'name' | 'description' | 'status' | 'priority' | 'budget' | 'target_date'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  createTask: (data: Pick<Task, 'project_id' | 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'assigned_to'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  
  uploadAsset: (data: Pick<Asset, 'name' | 'description' | 'type' | 'file_size' | 'mime_type'>) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  
  inviteMember: (email: string, role: MemberRole) => Promise<Invitation>;
  acceptInvitation: (token: string, name?: string) => Promise<{ success: boolean; organization: Organization }>;
  updateMemberRole: (userId: string, role: MemberRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  
  updateSubscriptionPlan: (plan: SubscriptionPlan) => Promise<OrganizationSubscription>;
  simulateWebhook: (
    eventType: 'subscription.created' | 'subscription.updated' | 'subscription.canceled' | 'invoice.paid' | 'invoice.payment_failed',
    payload: any
  ) => Promise<any>;
  
  runTenantIsolationTests: () => any[];
  resetToDemoSeeds: () => void;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  canPerform: (permission: Permission) => { allowed: boolean; reason?: string };
}

const NexoraContext = createContext<NexoraContextType | undefined>(undefined);

export function NexoraProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => getNexoraStore());
  const [tick, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, [store]);

  const currentOrg = store.getActiveOrg();
  const currentUser = store.getActiveUser();
  const currentMemberRole = store.getActiveMemberRole();
  const userOrganizations = store.getUserOrganizations();
  const projects = store.getProjects();
  const tasks = store.getTasks();
  const assets = store.getAssets();
  const members = store.getMembers();
  const activityLogs = store.getActivityLogs();
  const subscription = store.getSubscription();
  const usageStats = store.getUsageStats();
  const invitations = store.getInvitations();
  const allProfiles = store.getAllProfiles();

  const switchOrg = useCallback((orgId: string) => {
    setIsLoading(true);
    try {
      store.setActiveOrgId(orgId);
    } finally {
      setTimeout(() => setIsLoading(false), 150);
    }
  }, [store]);

  const switchUser = useCallback((userId: string) => {
    setIsLoading(true);
    try {
      store.setActiveUserId(userId);
    } finally {
      setTimeout(() => setIsLoading(false), 150);
    }
  }, [store]);

  const createOrganization = useCallback((name: string, domain?: string) => {
    return store.createOrganization(name, domain);
  }, [store]);

  const createProject = useCallback(async (data: any) => {
    return store.createProject(data);
  }, [store]);

  const updateProject = useCallback(async (id: string, updates: any) => {
    return store.updateProject(id, updates);
  }, [store]);

  const deleteProject = useCallback(async (id: string) => {
    store.deleteProject(id);
  }, [store]);

  const createTask = useCallback(async (data: any) => {
    return store.createTask(data);
  }, [store]);

  const updateTask = useCallback(async (id: string, updates: any) => {
    return store.updateTask(id, updates);
  }, [store]);

  const deleteTask = useCallback(async (id: string) => {
    store.deleteTask(id);
  }, [store]);

  const uploadAsset = useCallback(async (data: any) => {
    return store.uploadAsset(data);
  }, [store]);

  const deleteAsset = useCallback(async (id: string) => {
    store.deleteAsset(id);
  }, [store]);

  const inviteMember = useCallback(async (email: string, role: MemberRole) => {
    return store.inviteMember(email, role);
  }, [store]);

  const acceptInvitation = useCallback(async (token: string, name?: string) => {
    return store.acceptInvitation(token, name);
  }, [store]);

  const updateMemberRole = useCallback(async (userId: string, role: MemberRole) => {
    store.updateMemberRole(userId, role);
  }, [store]);

  const removeMember = useCallback(async (userId: string) => {
    store.removeMember(userId);
  }, [store]);

  const updateSubscriptionPlan = useCallback(async (plan: SubscriptionPlan) => {
    return store.updateSubscriptionPlan(plan);
  }, [store]);

  const simulateWebhook = useCallback(async (eventType: any, payload: any) => {
    return store.simulateWebhookEvent(eventType, payload);
  }, [store]);

  const runTenantIsolationTests = useCallback(() => {
    return store.testTenantIsolation();
  }, [store]);

  const resetToDemoSeeds = useCallback(() => {
    store.resetToSeeds();
  }, [store]);

  const checkHasPermission = useCallback(
    (permission: Permission) => {
      return checkRolePermission(currentMemberRole, permission);
    },
    [currentMemberRole]
  );

  const checkCanPerform = useCallback(
    (permission: Permission) => {
      return canPerformAction(currentMemberRole, permission);
    },
    [currentMemberRole]
  );

  return (
    <NexoraContext.Provider
      value={{
        currentOrg,
        currentUser,
        currentMemberRole,
        userOrganizations,
        projects,
        tasks,
        assets,
        members,
        activityLogs,
        subscription,
        usageStats,
        invitations,
        allProfiles,
        isLoading,
        switchOrg,
        switchUser,
        createOrganization,
        createProject,
        updateProject,
        deleteProject,
        createTask,
        updateTask,
        deleteTask,
        uploadAsset,
        deleteAsset,
        inviteMember,
        acceptInvitation,
        updateMemberRole,
        removeMember,
        updateSubscriptionPlan,
        simulateWebhook,
        runTenantIsolationTests,
        resetToDemoSeeds,
        hasPermission: checkHasPermission,
        canPerform: checkCanPerform,
      }}
    >
      {children}
    </NexoraContext.Provider>
  );
}

export function useNexora() {
  const context = useContext(NexoraContext);
  if (!context) {
    throw new Error('useNexora must be used within a NexoraProvider');
  }
  return context;
}
