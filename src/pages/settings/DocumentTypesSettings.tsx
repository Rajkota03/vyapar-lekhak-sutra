
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Container, Section, Stack } from "@/components/ui/primitives/Spacing";
import { ModernCard } from "@/components/ui/primitives/ModernCard";
import { PremiumButton } from "@/components/ui/primitives/PremiumButton";
import { Heading2, Heading3, CaptionText } from "@/components/ui/primitives/Typography";
import { Input } from "@/components/ui/input";
import { useCustomDocumentTypes } from "@/hooks/useCustomDocumentTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";

const DocumentTypesSettings = () => {
  const { customDocumentTypes, isLoading, createCustomDocumentType, deleteCustomDocumentType } = useCustomDocumentTypes();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePrefix, setNewTypePrefix] = useState("");

  const handleCreate = async () => {
    if (!newTypeName.trim() || !newTypePrefix.trim()) {
      return;
    }

    try {
      await createCustomDocumentType.mutateAsync({
        name: newTypeName.trim(),
        codePrefix: newTypePrefix.trim().toUpperCase(),
      });
      setNewTypeName("");
      setNewTypePrefix("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating document type:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomDocumentType.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting document type:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Container>
          <Section className="pt-6">
            <div className="flex justify-center items-center h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </Section>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container>
        <Section className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Heading2>Document Types</Heading2>
              <CaptionText className="mt-1">
                Create and manage custom document types for your business
              </CaptionText>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <PremiumButton variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document Type
                </PremiumButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Document Type</DialogTitle>
                  <DialogDescription>
                    Add a new document type that will appear in your navigation menu.
                  </DialogDescription>
                </DialogHeader>
                <Stack>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Document Type Name
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g., Credit Note, Purchase Order"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="prefix" className="block text-sm font-medium mb-2">
                      Code Prefix
                    </label>
                    <Input
                      id="prefix"
                      placeholder="e.g., CR, PO"
                      value={newTypePrefix}
                      onChange={(e) => setNewTypePrefix(e.target.value.toUpperCase())}
                    />
                    <CaptionText className="mt-1">
                      This will be used to generate document numbers (e.g., CR-001)
                    </CaptionText>
                  </div>
                </Stack>
                <DialogFooter>
                  <PremiumButton
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </PremiumButton>
                  <PremiumButton
                    variant="primary"
                    onClick={handleCreate}
                    disabled={!newTypeName.trim() || !newTypePrefix.trim() || createCustomDocumentType.isPending}
                  >
                    {createCustomDocumentType.isPending ? "Creating..." : "Create"}
                  </PremiumButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ModernCard variant="outlined" padding="md">
            <Stack>
              <Heading3>Built-in Document Types</Heading3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Invoice</div>
                    <CaptionText>Standard invoices (INV-001)</CaptionText>
                  </div>
                  <CaptionText>Built-in</CaptionText>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Pro Forma</div>
                    <CaptionText>Pro forma invoices (PF-001)</CaptionText>
                  </div>
                  <CaptionText>Built-in</CaptionText>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Quotation</div>
                    <CaptionText>Price quotes (QUO-001)</CaptionText>
                  </div>
                  <CaptionText>Built-in</CaptionText>
                </div>
              </div>
            </Stack>
          </ModernCard>

          <ModernCard variant="outlined" padding="md">
            <Stack>
              <Heading3>Custom Document Types</Heading3>
              {customDocumentTypes.length === 0 ? (
                <div className="text-center py-8">
                  <CaptionText>No custom document types created yet.</CaptionText>
                  <PremiumButton
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Custom Type
                  </PremiumButton>
                </div>
              ) : (
                <div className="grid gap-3">
                  {customDocumentTypes.map((docType) => (
                    <div key={docType.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{docType.name}</div>
                        <CaptionText>
                          Document numbers: {docType.code_prefix}-{docType.next_sequence.toString().padStart(3, '0')}
                        </CaptionText>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <PremiumButton
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </PremiumButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document Type</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{docType.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(docType.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </Stack>
          </ModernCard>
        </Section>
      </Container>
    </DashboardLayout>
  );
};

export default DocumentTypesSettings;
