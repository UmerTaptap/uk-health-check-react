import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { DocumentType, DocumentStatus } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Define the form schema
const documentUploadSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  type: z.enum(['gas_safety', 'electrical', 'epc', 'fire_safety', 'asbestos', 'other'] as const),
  issueDate: z.date({ required_error: 'Issue date is required' }),
  expiryDate: z.date().optional(),
  status: z.enum(['valid', 'expiring_soon', 'expired'] as const),
  notes: z.string().optional(),
  file: z.any()
    .refine((file) => file && file.length > 0, {
      message: 'A document file is required',
    })
    .refine((file) => {
      if (!file || file.length === 0) return true;
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      return validTypes.includes(file[0].type);
    }, {
      message: 'File must be a PDF, DOCX, JPG, or PNG',
    })
    .refine((file) => {
      if (!file || file.length === 0) return true;
      return file[0].size <= 5 * 1024 * 1024; // 5MB
    }, {
      message: 'File size must be less than 5MB',
    }),
});

type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

interface DocumentUploadFormProps {
  propertyId: string;
  onSuccess: () => void;
}

export default function DocumentUploadForm({ propertyId, onSuccess }: DocumentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DocumentUploadFormValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      title: '',
      type: 'other',
      issueDate: new Date(),
      status: 'valid',
      notes: '',
    },
  });

  async function onSubmit(values: DocumentUploadFormValues) {
    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      // Convert string propertyId to number for API
      formData.append('propertyId', propertyId);
      formData.append('title', values.title);
      formData.append('type', values.type);
      formData.append('issueDate', values.issueDate.toISOString());
      formData.append('status', values.status);

      if (values.expiryDate) {
        formData.append('expiryDate', values.expiryDate.toISOString());
      }

      if (values.notes) {
        formData.append('notes', values.notes);
      }

      // Add the current user as uploadedBy
      // In a real app, this would be the logged-in user's ID
      formData.append('uploadedBy', '1'); 

      // Append the file
      if (values.file && values.file.length > 0) {
        formData.append('file', values.file[0]);
      }

      // Send the request
      const response = await fetch('/api/upload/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const result = await response.json();

      toast({
        title: 'Document Uploaded',
        description: 'The document has been successfully uploaded.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was a problem uploading your document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter document title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gas_safety">Gas Safety Certificate</SelectItem>
                    <SelectItem value="electrical">Electrical Safety Certificate</SelectItem>
                    <SelectItem value="epc">Energy Performance Certificate (EPC)</SelectItem>
                    <SelectItem value="fire_safety">Fire Safety Certificate</SelectItem>
                    <SelectItem value="asbestos">Asbestos Management Report</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Select a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Select a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < form.getValues('issueDate')}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Only required for documents with an expiry date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes about this document"
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Additional information about the document or condition
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Document</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOCX, JPG, or PNG (max 5MB)
                  </p>
                  <Input
                    {...field}
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      onChange(e.target.files);
                    }}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    Select File
                  </label>
                  {value && value[0] && (
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Selected: {value[0].name} ({Math.round(value[0].size / 1024)} KB)
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </Form>
  );
}