import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Smartphone, 
  Key, 
  Plus, 
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { mfaService, MFADevice } from '@/services/auth/MFAService';
import { MFASetupDialog } from './MFASetupDialog';
import { toast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface MFAManagerProps {
  onMFAStatusChange?: (enabled: boolean) => void;
}

export const MFAManager: React.FC<MFAManagerProps> = ({
  onMFAStatusChange
}) => {
  const [devices, setDevices] = useState<MFADevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);

  useEffect(() => {
    loadMFADevices();
  }, []);

  const loadMFADevices = async () => {
    setIsLoading(true);
    try {
      const userDevices = await mfaService.getMFADevices();
      setDevices(userDevices);
      
      const hasMFA = userDevices.some(device => device.is_active);
      onMFAStatusChange?.(hasMFA);
    } catch (error) {
      console.error('Error loading MFA devices:', error);
      toast({
        title: "Error",
        description: "Failed to load MFA devices.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    loadMFADevices();
    setIsSetupOpen(false);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setRemovingDevice(deviceId);
    try {
      const success = await mfaService.removeMFADevice(deviceId);
      if (success) {
        await loadMFADevices();
      }
    } catch (error) {
      console.error('Error removing MFA device:', error);
      toast({
        title: "Error",
        description: "Failed to remove MFA device.",
        variant: "destructive",
      });
    } finally {
      setRemovingDevice(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'totp':
        return <Smartphone className="h-4 w-4" />;
      case 'backup_codes':
        return <Key className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getDeviceTypeName = (deviceType: string) => {
    switch (deviceType) {
      case 'totp':
        return 'Authenticator App';
      case 'backup_codes':
        return 'Backup Codes';
      default:
        return deviceType;
    }
  };

  const activeDevices = devices.filter(device => device.is_active);
  const hasMFA = activeDevices.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Factor Authentication
            {hasMFA ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                <ShieldX className="h-3 w-3 mr-1" />
                Disabled
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasMFA ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Enhance your account security:</strong> Enable multi-factor authentication to protect sensitive operations like data restore and export.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>
                <strong>Account is secured:</strong> MFA is enabled and protecting your sensitive operations.
              </AlertDescription>
            </Alert>
          )}

          {devices.length === 0 ? (
            <div className="text-center py-6">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No MFA devices configured</h3>
              <p className="text-muted-foreground mb-4">
                Set up multi-factor authentication to secure your account.
              </p>
              <Button onClick={() => setIsSetupOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Set Up MFA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Configured Devices</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSetupOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.device_type)}
                          {device.device_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDeviceTypeName(device.device_type)}
                      </TableCell>
                      <TableCell>
                        {device.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {device.last_used_at ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(device.last_used_at), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={removingDevice === device.id}
                            >
                              {removingDevice === device.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove MFA Device</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{device.device_name}"? 
                                This action cannot be undone.
                                {device.device_type === 'backup_codes' && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                    <strong>Warning:</strong> Removing backup codes will permanently delete all unused codes.
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveDevice(device.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove Device
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Security Benefits:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Protects data restore and export operations</li>
              <li>Prevents unauthorized access to sensitive features</li>
              <li>Complies with security best practices</li>
              <li>Provides backup access if primary device is lost</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <MFASetupDialog
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSetupComplete={handleSetupComplete}
      />
    </>
  );
};