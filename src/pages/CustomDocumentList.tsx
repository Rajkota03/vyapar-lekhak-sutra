
import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Container, Section } from "@/components/ui/primitives/Spacing";
import { Heading2, CaptionText } from "@/components/ui/primitives/Typography";
import { useCustomDocumentTypes } from "@/hooks/useCustomDocumentTypes";

const CustomDocumentList = () => {
  const { documentTypeId } = useParams();
  const { customDocumentTypes, isLoading } = useCustomDocumentTypes();

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

  const documentType = customDocumentTypes.find(dt => dt.id === documentTypeId);

  if (!documentType) {
    return (
      <DashboardLayout>
        <Container>
          <Section className="pt-6">
            <div className="text-center py-8">
              <Heading2>Document Type Not Found</Heading2>
              <CaptionText className="mt-2">
                The requested document type could not be found.
              </CaptionText>
            </div>
          </Section>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container>
        <Section className="pt-6">
          <div className="mb-6">
            <Heading2>{documentType.name}</Heading2>
            <CaptionText className="mt-1">
              Manage your {documentType.name.toLowerCase()} documents
            </CaptionText>
          </div>
          
          <div className="text-center py-12">
            <CaptionText>
              Document listing functionality will be implemented soon.
            </CaptionText>
          </div>
        </Section>
      </Container>
    </DashboardLayout>
  );
};

export default CustomDocumentList;
