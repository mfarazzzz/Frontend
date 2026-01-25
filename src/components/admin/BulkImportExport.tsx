import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BulkImportExportProps {
  contentType: string;
  data: any[];
  onImport: (items: any[]) => Promise<void>;
}

interface ImportPreview {
  valid: any[];
  invalid: { row: number; data: any; errors: string[] }[];
}

// Field mappings for each content type
const contentTypeFields: Record<string, { required: string[]; optional: string[]; displayName: string }> = {
  exams: {
    displayName: 'परीक्षाएं',
    required: ['title', 'titleHindi', 'examDate', 'category'],
    optional: ['organization', 'organizationHindi', 'description', 'image', 'slug', 'status']
  },
  results: {
    displayName: 'परिणाम',
    required: ['title', 'titleHindi', 'resultDate', 'category'],
    optional: ['organization', 'organizationHindi', 'description', 'resultLink', 'image', 'slug']
  },
  institutions: {
    displayName: 'संस्थान',
    required: ['name', 'nameHindi', 'type'],
    optional: ['board', 'address', 'addressHindi', 'phone', 'website', 'description', 'image', 'slug']
  },
  holidays: {
    displayName: 'छुट्टियाँ',
    required: ['name', 'nameHindi', 'date', 'type'],
    optional: ['description', 'descriptionHindi', 'image', 'slug', 'isRecurring']
  },
  restaurants: {
    displayName: 'रेस्तरां',
    required: ['name', 'nameHindi', 'type'],
    optional: ['cuisine', 'priceRange', 'address', 'addressHindi', 'phone', 'rating', 'image', 'slug']
  },
  fashion: {
    displayName: 'फैशन स्टोर',
    required: ['name', 'nameHindi', 'type'],
    optional: ['category', 'brands', 'address', 'addressHindi', 'phone', 'image', 'slug']
  },
  shopping: {
    displayName: 'शॉपिंग सेंटर',
    required: ['name', 'nameHindi', 'type'],
    optional: ['storeCount', 'stores', 'address', 'addressHindi', 'phone', 'image', 'slug']
  },
  places: {
    displayName: 'प्रसिद्ध स्थान',
    required: ['name', 'nameHindi', 'type'],
    optional: ['address', 'addressHindi', 'description', 'rating', 'image', 'slug']
  },
  events: {
    displayName: 'कार्यक्रम',
    required: ['title', 'titleHindi', 'date'],
    optional: ['time', 'venue', 'venueHindi', 'description', 'image', 'slug', 'status']
  },
  news: {
    displayName: 'समाचार',
    required: ['title', 'excerpt', 'category'],
    optional: ['content', 'author', 'publishedDate', 'image', 'slug', 'isFeatured', 'isBreaking', 'metaDescription', 'keywords']
  }
};

const BulkImportExport = ({ contentType, data, onImport }: BulkImportExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fields = contentTypeFields[contentType] || contentTypeFields.news;

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || `item-${Date.now()}`;
  };

  const csvEscape = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    const mustQuote = /[",\r\n]/.test(text);
    const escaped = text.replace(/"/g, '""');
    return mustQuote ? `"${escaped}"` : escaped;
  };

  const toCsv = (rows: Record<string, any>[], columns: string[]) => {
    const header = columns.map(csvEscape).join(',');
    const lines = rows.map((row) => columns.map((col) => csvEscape(row[col])).join(','));
    return [header, ...lines].join('\r\n');
  };

  const parseCsv = (text: string) => {
    const rows: string[][] = [];
    let currentField = '';
    let currentRow: string[] = [];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];
      if (inQuotes) {
        if (char === '"' && next === '"') {
          currentField += '"';
          i++;
          continue;
        }
        if (char === '"') {
          inQuotes = false;
          continue;
        }
        currentField += char;
        continue;
      }
      if (char === '"') {
        inQuotes = true;
        continue;
      }
      if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        continue;
      }
      if (char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        const normalized = currentRow.map((v) => v.replace(/\r$/, ''));
        const hasAnyValue = normalized.some((v) => v.trim() !== '');
        if (hasAnyValue) rows.push(normalized);
        currentRow = [];
        continue;
      }
      currentField += char;
    }
    currentRow.push(currentField);
    const normalized = currentRow.map((v) => v.replace(/\r$/, ''));
    const hasAnyValue = normalized.some((v) => v.trim() !== '');
    if (hasAnyValue) rows.push(normalized);
    return rows;
  };

  const downloadFile = (fileName: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export functionality
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('निर्यात करने के लिए कोई डेटा नहीं है');
      return;
    }

    // Prepare data for export - flatten objects and arrays
    const exportData = data.map(item => {
      const flatItem: Record<string, any> = {};
      Object.keys(item).forEach(key => {
        if (Array.isArray(item[key])) {
          flatItem[key] = item[key].join(', ');
        } else if (typeof item[key] === 'object' && item[key] !== null) {
          flatItem[key] = JSON.stringify(item[key]);
        } else {
          flatItem[key] = item[key];
        }
      });
      return flatItem;
    });
    const columns = [...fields.required, ...fields.optional];
    const csv = toCsv(exportData, columns);
    downloadFile(
      `${contentType}_export_${new Date().toISOString().split('T')[0]}.csv`,
      csv,
      'text/csv;charset=utf-8',
    );

    toast.success(`${data.length} आइटम CSV में निर्यात किए गए`);
  };

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      [...fields.required, ...fields.optional].reduce((acc, field) => {
        acc[field] = field === 'title' || field === 'name' ? 'Example Item' : '';
        return acc;
      }, {} as Record<string, string>)
    ];
    const columns = [...fields.required, ...fields.optional];
    const csv = toCsv(templateData, columns);
    downloadFile(`${contentType}_template.csv`, csv, 'text/csv;charset=utf-8');
    
    toast.success('टेम्पलेट डाउनलोड हो गया');
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = typeof event.target?.result === 'string' ? event.target.result : '';
        const rows = parseCsv(raw);
        if (rows.length < 2) {
          toast.error('CSV फाइल में डेटा नहीं मिला');
          return;
        }
        const header = rows[0].map((h) => h.trim());
        const jsonData = rows.slice(1).map((row) => {
          const obj: Record<string, any> = {};
          header.forEach((key, idx) => {
            obj[key] = row[idx] ?? '';
          });
          return obj;
        });

        // Validate data
        const preview: ImportPreview = { valid: [], invalid: [] };

        jsonData.forEach((row: any, index: number) => {
          const errors: string[] = [];
          
          // Check required fields
          fields.required.forEach(field => {
            if (!row[field] || String(row[field]).trim() === '') {
              errors.push(`"${field}" आवश्यक है`);
            }
          });

          // Process arrays from comma-separated strings
          const processedRow = { ...row };
          if (processedRow.cuisine && typeof processedRow.cuisine === 'string') {
            processedRow.cuisine = processedRow.cuisine.split(',').map((s: string) => s.trim());
          }
          if (processedRow.brands && typeof processedRow.brands === 'string') {
            processedRow.brands = processedRow.brands.split(',').map((s: string) => s.trim());
          }
          if (processedRow.stores && typeof processedRow.stores === 'string') {
            processedRow.stores = processedRow.stores.split(',').map((s: string) => s.trim());
          }

          // Generate slug if not provided
          if (!processedRow.slug) {
            processedRow.slug = generateSlug(processedRow.title || processedRow.name || '');
          }

          // Convert boolean strings
          if (processedRow.isFeatured !== undefined) {
            processedRow.isFeatured = processedRow.isFeatured === true || processedRow.isFeatured === 'true' || processedRow.isFeatured === '1';
          }
          if (processedRow.isBreaking !== undefined) {
            processedRow.isBreaking = processedRow.isBreaking === true || processedRow.isBreaking === 'true' || processedRow.isBreaking === '1';
          }
          if (processedRow.isRecurring !== undefined) {
            processedRow.isRecurring = processedRow.isRecurring === true || processedRow.isRecurring === 'true' || processedRow.isRecurring === '1';
          }

          // Convert numbers
          if (processedRow.rating) {
            processedRow.rating = parseFloat(processedRow.rating);
          }
          if (processedRow.storeCount) {
            processedRow.storeCount = parseInt(processedRow.storeCount);
          }

          if (errors.length === 0) {
            preview.valid.push(processedRow);
          } else {
            preview.invalid.push({ row: index + 2, data: row, errors });
          }
        });

        setImportPreview(preview);
      };
      reader.readAsText(file, 'utf-8');
    } catch (error) {
      toast.error('फाइल पढ़ने में त्रुटि');
      console.error('File read error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Execute import
  const executeImport = async () => {
    if (!importPreview || importPreview.valid.length === 0) {
      toast.error('आयात करने के लिए कोई वैध डेटा नहीं है');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const total = importPreview.valid.length;
      const batchSize = 10;
      
      for (let i = 0; i < total; i += batchSize) {
        const batch = importPreview.valid.slice(i, i + batchSize);
        await onImport(batch);
        setImportProgress(Math.min(100, ((i + batch.length) / total) * 100));
      }

      toast.success(`${total} आइटम सफलतापूर्वक आयात किए गए`);
      setImportPreview(null);
      setIsOpen(false);
    } catch (error) {
      toast.error('आयात में त्रुटि');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          बल्क आयात/निर्यात
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            बल्क आयात/निर्यात - {fields.displayName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'import' | 'export')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              निर्यात
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              आयात
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    <Badge variant="secondary">{data.length} आइटम</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    सभी {fields.displayName} को CSV फाइल में निर्यात करें
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleExport} className="gap-2">
                      <Download className="h-4 w-4" />
                      CSV में निर्यात
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-4">
            {!importPreview ? (
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="text-center space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <Label 
                        htmlFor="file-upload" 
                        className="cursor-pointer text-primary hover:underline"
                      >
                        फाइल चुनें या यहाँ ड्रॉप करें
                      </Label>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        CSV फाइल (अधिकतम 1000 पंक्तियां)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>आवश्यक फ़ील्ड:</Label>
                      <Button variant="ghost" size="sm" onClick={downloadTemplate} className="gap-1">
                        <Download className="h-3 w-3" />
                        टेम्पलेट डाउनलोड करें
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fields.required.map(field => (
                        <Badge key={field} variant="destructive">{field}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>वैकल्पिक फ़ील्ड:</Label>
                    <div className="flex flex-wrap gap-2">
                      {fields.optional.map(field => (
                        <Badge key={field} variant="secondary">{field}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Preview Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                    <CardContent className="pt-4 flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-700">{importPreview.valid.length}</p>
                        <p className="text-sm text-green-600">वैध पंक्तियां</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
                    <CardContent className="pt-4 flex items-center gap-3">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold text-red-700">{importPreview.invalid.length}</p>
                        <p className="text-sm text-red-600">त्रुटि पंक्तियां</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Invalid Rows */}
                {importPreview.invalid.length > 0 && (
                  <Card className="border-amber-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <h4 className="font-medium">त्रुटियाँ ({importPreview.invalid.length})</h4>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {importPreview.invalid.slice(0, 10).map((item, i) => (
                          <div key={i} className="text-sm bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                            <span className="font-mono text-amber-700">पंक्ति {item.row}:</span>
                            <span className="ml-2 text-muted-foreground">{item.errors.join(', ')}</span>
                          </div>
                        ))}
                        {importPreview.invalid.length > 10 && (
                          <p className="text-xs text-muted-foreground">
                            ...और {importPreview.invalid.length - 10} त्रुटियाँ
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Valid Rows Preview */}
                {importPreview.valid.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-3">पूर्वावलोकन (पहले 5)</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(importPreview.valid[0]).slice(0, 4).map(key => (
                                <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importPreview.valid.slice(0, 5).map((row, i) => (
                              <TableRow key={i}>
                                {Object.values(row).slice(0, 4).map((val: any, j) => (
                                  <TableCell key={j} className="max-w-[200px] truncate">
                                    {Array.isArray(val) ? val.join(', ') : String(val || '')}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Import Progress */}
                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={importProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      आयात हो रहा है... {Math.round(importProgress)}%
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setImportPreview(null)}
                    disabled={isImporting}
                  >
                    रद्द करें
                  </Button>
                  <Button 
                    onClick={executeImport}
                    disabled={isImporting || importPreview.valid.length === 0}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {importPreview.valid.length} आइटम आयात करें
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportExport;
