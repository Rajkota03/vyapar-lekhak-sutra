import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Container, Section } from "@/components/ui/primitives/Spacing";
import { Heading1, CaptionText } from "@/components/ui/primitives/Typography";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCustomDocumentTypes } from "@/hooks/useCustomDocumentTypes";
import { useCustomDocuments } from "@/hooks/useCustomDocuments";
import { FloatingActionBar } from "@/components/layout/FloatingActionBar";
import InvoiceTable from "@/components/invoice/InvoiceTable";
import MobileSortDropdown from "@/components/invoice/MobileSortDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

type FilterStatus = "all" | "sent" | "paid" | "draft";
type SortField = 'number' | 'client' | 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

const CustomDocumentList = () => {
  const {
    documentTypeId
  } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const {
    customDocumentTypes,
    isLoading: isLoadingTypes
  } = useCustomDocumentTypes();
  const {
    documents,
    isLoading: isLoadingDocuments,
    refetch
  } = useCustomDocuments(documentTypeId || '');
  if (isLoadingTypes) {
    return <DashboardLayout>
        <Container>
          <Section className="pt-6">
            <div className="flex justify-center items-center h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </Section>
        </Container>
      </DashboardLayout>;
  }
  const documentType = customDocumentTypes.find(dt => dt.id === documentTypeId);
  if (!documentType) {
    return <DashboardLayout>
        <Container>
          <Section className="pt-6">
            <div className="text-center py-8">
              <Heading1>Document Type Not Found</Heading1>
              <CaptionText className="mt-2">
                The requested document type could not be found.
              </CaptionText>
            </div>
          </Section>
        </Container>
      </DashboardLayout>;
  }

  // Filter documents by status
  const filteredDocuments = React.useMemo(() => {
    if (filterStatus === 'all') return documents;
    return documents.filter(doc => doc.status === filterStatus);
  }, [documents, filterStatus]);

  // Sort documents
  const sortedDocuments = React.useMemo(() => {
    if (!filteredDocuments || !sortField || !sortDirection) return filteredDocuments || [];
    return [...filteredDocuments].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      switch (sortField) {
        case 'number':
          aValue = a.invoice_code || a.number || '';
          bValue = b.invoice_code || b.number || '';
          break;
        case 'client':
          aValue = a.clients?.name || '';
          bValue = b.clients?.name || '';
          break;
        case 'date':
          aValue = a.issue_date ? new Date(a.issue_date).getTime() : 0;
          bValue = b.issue_date ? new Date(b.issue_date).getTime() : 0;
          break;
        case 'amount':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDocuments, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const handleDocumentClick = (documentId: string) => {
    navigate(`/custom/${documentTypeId}/${documentId}`);
  };
  const handleCreateDocument = () => {
    navigate(`/custom/${documentTypeId}/new`);
  };
  const floatingActions = [{
    label: `New ${documentType.name}`,
    onClick: handleCreateDocument,
    variant: "primary" as const,
    icon: <Plus className="h-6 w-6" />
  }];
  return <DashboardLayout>
      <div className="space-y-6 bg-white px-0 py-[8px]">
        {/* Header */}
        <div className="flex items-center justify-between py-0 my-[8px]">
          <div className="px-[8px]">
            <Heading1>{documentType.name}</Heading1>
            <CaptionText className="mt-1">
              Manage your {documentType.name.toLowerCase()} documents
            </CaptionText>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between px-[8px]">
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('sent')}>
                  Sent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('paid')}>
                  Paid
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sort Dropdown */}
          {isMobile ? <MobileSortDropdown sortField={sortField} sortDirection={sortDirection} onSort={handleSort} /> : <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Sort by: {sortField ? sortField.charAt(0).toUpperCase() + sortField.slice(1) : 'Date'} {sortDirection === 'asc' ? '↑' : '↓'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleSort('number')}>
                    Document #
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('client')}>
                    Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('date')}>
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('amount')}>
                    Amount
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('status')}>
                    Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
        </div>

        {/* Documents Table */}
        {isLoadingDocuments ? <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div> : sortedDocuments && sortedDocuments.length > 0 ? <InvoiceTable invoices={sortedDocuments} onInvoiceClick={handleDocumentClick} sortField={sortField} sortDirection={sortDirection} onSort={!isMobile ? handleSort : undefined} /> : <div className="text-center py-12 border rounded-md mx-[8px]">
            <p className="text-muted-foreground mb-4">
              No {documentType.name.toLowerCase()} documents found
            </p>
            <Button variant="outline" onClick={handleCreateDocument}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first {documentType.name.toLowerCase()}
            </Button>
          </div>}

        {/* Floating Action Button */}
        <FloatingActionBar actions={floatingActions} show={true} />
      </div>
    </DashboardLayout>;
};

export default CustomDocumentList;
