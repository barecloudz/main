import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Calendar, FileText, TrendingUp, BarChart2, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

export default function ClientReports() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('all');
  const [activeTab, setActiveTab] = useState('performance');

  // Fetch documents that are reports
  const { data: reports, isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/documents`],
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (value: string) => {
    setReportType(value);
  };

  // Filter reports based on search and type
  const filteredReports = reports?.filter((report: any) => {
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = reportType === 'all' || report.type === reportType;
    
    return matchesSearch && matchesType && report.type === 'report';
  }) || [];

  // Sample performance metrics data (this would come from API in a real app)
  const performanceMetrics = [
    { metric: 'Website Traffic', current: '5,432', previous: '4,210', change: '+29%', trend: 'up' },
    { metric: 'Conversion Rate', current: '3.8%', previous: '2.9%', change: '+31%', trend: 'up' },
    { metric: 'Social Media Engagement', current: '9,876', previous: '7,654', change: '+29%', trend: 'up' },
    { metric: 'Email Open Rate', current: '24.6%', previous: '22.1%', change: '+11.3%', trend: 'up' },
    { metric: 'Ad Click-Through Rate', current: '2.9%', previous: '3.2%', change: '-9.4%', trend: 'down' },
  ];

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="performance" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketing Reports</h1>
            <p className="text-muted-foreground">
              View performance metrics and marketing reports for your business
            </p>
          </div>
          <TabsList className="mt-4 md:mt-0">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="documents">Report Documents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Key marketing metrics from the last 30 days compared to the previous period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead>Previous Period</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceMetrics.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.metric}</TableCell>
                      <TableCell>{item.current}</TableCell>
                      <TableCell>{item.previous}</TableCell>
                      <TableCell>
                        <Badge variant={item.trend === 'up' ? 'default' : 'destructive'}>
                          {item.change}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                  Campaign Results
                </CardTitle>
                <CardDescription>
                  Results from your most recent marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <p className="text-muted-foreground">Campaign visualization will appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Upcoming Reports
                </CardTitle>
                <CardDescription>
                  Scheduled reports and analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Monthly Performance Summary</p>
                      <p className="text-sm text-muted-foreground">End of month</p>
                    </div>
                    <Badge>Scheduled</Badge>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Quarterly Business Review</p>
                      <p className="text-sm text-muted-foreground">End of quarter</p>
                    </div>
                    <Badge>Scheduled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Campaign Effectiveness Analysis</p>
                      <p className="text-sm text-muted-foreground">Mid-month</p>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Documents</CardTitle>
              <CardDescription>
                Download and view your marketing reports and analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select value={reportType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : filteredReports.length > 0 ? (
                <div className="space-y-4">
                  {filteredReports.map((report: any) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-lg mr-4">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()} • {report.fileName}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || reportType !== 'all' ? 
                    "No reports match your search criteria." : 
                    "No reports available yet. Check back soon for updates on your marketing performance."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}