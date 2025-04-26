import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Standard, StandardType } from "@/types";
import { Plus, X } from "lucide-react";

interface CreateStandardFormProps {
  onSubmit: (standard: Standard) => void;
}

export const CreateStandardForm = ({ onSubmit }: CreateStandardFormProps) => {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [type, setType] = useState<StandardType>("framework");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements(prev => [...prev, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newStandard: Standard = {
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${version}`,
      name,
      version,
      type,
      description,
      category,
      requirements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newStandard);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter standard name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Enter version number"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as StandardType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="framework">Framework</SelectItem>
              <SelectItem value="regulation">Regulation</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="guideline">Guideline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter standard description"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Requirements</Label>
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Enter requirement ID"
            />
            <Button type="button" onClick={handleAddRequirement}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={req} readOnly />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRequirement(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Create Standard</Button>
      </div>
    </form>
  );
}; 