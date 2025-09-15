import * as React from "react";
import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Download,
  MoreVertical,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Users as UsersIcon,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface Meeting {
  id: number;
  name: string;
  organization: string;
  reason: string;
  email?: string;
  phone?: string;
  preferred_datetime?: string;
  created_at: string;
  comment?: string;
  signature?: string;
  status?: 'pending' | 'scheduled' | 'completed';
  assigned_datetime?: string;
}

interface MeetingsTableProps {
  meetings: Meeting[];
  onMeetingSelect: (meeting: Meeting) => void;
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: number) => void;
}

export function MeetingsTable({ meetings, onMeetingSelect, onEditMeeting, onDeleteMeeting }: MeetingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  
  // Mobile pagination settings
  const itemsPerPage = isMobile ? 5 : 10;

  // Filter and sort meetings
  const filteredMeetings = meetings
    .filter(meeting => {
      const matchesSearch = 
        meeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === "all" || meeting.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "organization":
          return a.organization.localeCompare(b.organization);
        case "status":
          return (a.status || "pending").localeCompare(b.status || "pending");
        case "date":
        default:
          const dateA = a.assigned_datetime || a.created_at;
          const dateB = b.assigned_datetime || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled':
        return "bg-green-50 text-green-700 border-green-200";
      case 'completed':
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusStats = () => {
    const stats = meetings.reduce((acc, meeting) => {
      const status = meeting.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      pending: stats.pending || 0,
      scheduled: stats.scheduled || 0,
      completed: stats.completed || 0,
      total: meetings.length
    };
  };

  const stats = getStatusStats();

  // Mobile Meeting Card Component
  const MobileMeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <Card 
      key={meeting.id}
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onMeetingSelect(meeting)}
    >
      <div className="space-y-3">
        {/* Header with avatar and name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                {getInitials(meeting.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{meeting.name}</p>
              <p className="text-xs text-muted-foreground">{meeting.organization}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(meeting.status)}
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(meeting.status)}`}
            >
              {meeting.status || 'pending'}
            </Badge>
          </div>
        </div>

        {/* Meeting details */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {meeting.reason}
          </p>
          
          {/* Contact info */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {meeting.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{meeting.email}</span>
              </div>
            )}
            {meeting.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{meeting.phone}</span>
              </div>
            )}
          </div>

          {/* Time info */}
          <div className="text-xs">
            {meeting.assigned_datetime ? (
              <div className="flex items-center space-x-1 text-green-700">
                <CalendarDays className="w-3 h-3" />
                <span>{formatDateTime(meeting.assigned_datetime)}</span>
              </div>
            ) : meeting.preferred_datetime ? (
              <div className="flex items-center space-x-1 text-orange-700">
                <Clock className="w-3 h-3" />
                <span>Prefers: {formatDateTime(meeting.preferred_datetime)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <AlertCircle className="w-3 h-3" />
                <span>Not scheduled</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onMeetingSelect(meeting);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEditMeeting(meeting);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Meeting
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMeeting(meeting.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground">
              Manage and track all your scheduled meetings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">{stats.scheduled}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile vs Desktop View */}
      {isMobile ? (
        /* Mobile Card View */
        <div className="space-y-4">
          {paginatedMeetings.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center space-y-2">
                <UsersIcon className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground text-center">No meetings found</p>
              </div>
            </Card>
          ) : (
            paginatedMeetings.map((meeting) => (
              <MobileMeetingCard key={meeting.id} meeting={meeting} />
            ))
          )}
          
          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredMeetings.length} meetings)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium min-w-[2rem] text-center">
                  {currentPage}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-[300px] font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Organization</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Scheduled Time</TableHead>
                  <TableHead className="font-semibold">Meeting Purpose</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <UsersIcon className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No meetings found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMeetings.map((meeting) => (
                    <TableRow 
                      key={meeting.id} 
                      className="hover:bg-muted/50 cursor-pointer group"
                      onClick={() => onMeetingSelect(meeting)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-medium">
                              {getInitials(meeting.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium leading-none">{meeting.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              {meeting.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{meeting.email}</span>
                                </div>
                              )}
                              {meeting.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{meeting.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{meeting.organization}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(meeting.status)}
                          <Badge 
                            variant="outline" 
                            className={`capitalize ${getStatusColor(meeting.status)}`}
                          >
                            {meeting.status || 'pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {meeting.assigned_datetime ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <CalendarDays className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="font-medium text-green-700">
                                {formatDateTime(meeting.assigned_datetime)}
                              </p>
                            </div>
                          </div>
                        ) : meeting.preferred_datetime ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="text-muted-foreground">Prefers:</p>
                              <p className="font-medium text-orange-700">
                                {formatDateTime(meeting.preferred_datetime)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <span>Not scheduled</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {meeting.reason}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onMeetingSelect(meeting);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onEditMeeting(meeting);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Meeting
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMeeting(meeting.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredMeetings.length)} of {filteredMeetings.length} meetings
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}