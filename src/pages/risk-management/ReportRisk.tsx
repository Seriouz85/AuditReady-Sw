import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from '@/components/PageHeader';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const riskTypes = [
  "Information Security",
  "Physical Security",
  "Personnel Security",
  "Operational Security",
  "Technical Security",
  "Compliance",
  "Business Continuity",
  "Third-Party Risk",
  "Data Protection",
  "Access Control",
  "Network Security",
  "Application Security",
  "Cloud Security",
  "Incident Response",
  "Vulnerability Management"
];

const likelihoodLevels = [
  { value: "rare", label: "Rare (1)" },
  { value: "unlikely", label: "Unlikely (2)" },
  { value: "possible", label: "Possible (3)" },
  { value: "likely", label: "Likely (4)" },
  { value: "almost_certain", label: "Almost Certain (5)" }
];

const consequenceLevels = [
  { value: "negligible", label: "Negligible (1)" },
  { value: "minor", label: "Minor (2)" },
  { value: "moderate", label: "Moderate (3)" },
  { value: "major", label: "Major (4)" },
  { value: "severe", label: "Severe (5)" }
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  riskType: z.string().min(1, "Risk type is required"),
  likelihood: z.string().min(1, "Likelihood is required"),
  consequence: z.string().min(1, "Consequence is required"),
  affectedAssets: z.string().min(1, "Affected assets are required"),
  currentControls: z.string().optional(),
  proposedControls: z.string().optional(),
  riskOwner: z.string().min(1, "Risk owner is required"),
  riskOwnerEmail: z.string().email("Invalid email address"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

const ReportRisk = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      riskType: "",
      likelihood: "",
      consequence: "",
      affectedAssets: "",
      currentControls: "",
      proposedControls: "",
      riskOwner: "",
      riskOwnerEmail: "",
      dueDate: "",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // TODO: Implement API call to save risk
    navigate("/app/risk-management");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/app/risk-management")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <PageHeader 
          title="Report New Risk" 
          description="Submit a new information security risk for assessment"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter risk title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {riskTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select likelihood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {likelihoodLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consequence *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select consequence" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {consequenceLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the risk in detail"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectedAssets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Assets *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List the assets affected by this risk"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentControls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Controls</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe existing controls"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proposedControls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Controls</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe proposed controls"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="riskOwner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Owner *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter risk owner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskOwnerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Owner Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter risk owner email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/app/risk-management")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Submit Risk
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportRisk; 