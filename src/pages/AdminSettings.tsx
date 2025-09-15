import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Palette } from "lucide-react";

interface AdminSettingsProps {
  onAuthChange?: (isAuth: boolean) => void;
  onCreateMeetingChange?: (callback: (() => void) | null) => void;
}

export default function AdminSettings({ onAuthChange, onCreateMeetingChange }: AdminSettingsProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const authStatus = localStorage.getItem('accessToken') !== null;
    setIsAuthenticated(authStatus);
    onAuthChange?.(authStatus);
    
    if (!authStatus) {
      navigate('/admin');
    }
  }, [navigate, onAuthChange]);

  useEffect(() => {
    if (isAuthenticated && onCreateMeetingChange) {
      const createMeetingHandler = () => navigate('/admin');
      onCreateMeetingChange(createMeetingHandler);
      
      return () => {
        onCreateMeetingChange(null);
      };
    }
  }, [isAuthenticated, onCreateMeetingChange, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    onAuthChange?.(false);
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        meetings={[]}
        selectedMeeting={null}
        onMeetingSelect={() => {}}
        onCreateMeeting={() => navigate('/admin')}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the appearance of your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="theme-toggle" className="text-base">
                          Dark mode
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          Switch between light and dark themes
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        <Switch 
                          id="theme-toggle"
                          checked={theme === 'dark'}
                          onCheckedChange={toggleTheme}
                        />
                        <Moon className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Current theme</Label>
                          <div className="text-sm text-muted-foreground">
                            Currently using {theme} mode
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleTheme}
                          className="flex items-center gap-2"
                        >
                          {theme === 'light' ? (
                            <>
                              <Moon className="w-4 h-4" />
                              Switch to Dark
                            </>
                          ) : (
                            <>
                              <Sun className="w-4 h-4" />
                              Switch to Light
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Info</CardTitle>
                  <CardDescription>
                    Information about your MiniMeet application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment</span>
                      <span>Development</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Theme</span>
                      <span className="capitalize">{theme} mode</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}