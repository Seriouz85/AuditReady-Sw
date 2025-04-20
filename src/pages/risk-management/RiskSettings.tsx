import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from '@/components/PageHeader';
import { ArrowLeft, Save, Settings, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const RiskSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matrix');

  // Mock data for demonstration
  const [likelihoodLevels, setLikelihoodLevels] = useState([
    { id: 1, level: "Rare", description: "May occur only in exceptional circumstances", value: 1 },
    { id: 2, level: "Unlikely", description: "Could occur at some time", value: 2 },
    { id: 3, level: "Possible", description: "Might occur at some time", value: 3 },
    { id: 4, level: "Likely", description: "Will probably occur in most circumstances", value: 4 },
    { id: 5, level: "Almost Certain", description: "Expected to occur in most circumstances", value: 5 },
  ]);

  const [consequenceLevels, setConsequenceLevels] = useState([
    { id: 1, level: "Negligible", description: "No significant impact", value: 1 },
    { id: 2, level: "Minor", description: "Minor impact on operations", value: 2 },
    { id: 3, level: "Moderate", description: "Significant impact on operations", value: 3 },
    { id: 4, level: "Major", description: "Major impact on operations", value: 4 },
    { id: 5, level: "Severe", description: "Catastrophic impact on operations", value: 5 },
  ]);

  const [riskMatrix, setRiskMatrix] = useState([
    { id: 1, level: "Low", color: "bg-green-500", min: 1, max: 4 },
    { id: 2, level: "Medium", color: "bg-yellow-500", min: 5, max: 9 },
    { id: 3, level: "High", color: "bg-orange-500", min: 10, max: 15 },
    { id: 4, level: "Critical", color: "bg-red-500", min: 16, max: 25 },
  ]);

  const [riskStrategy, setRiskStrategy] = useState({
    low: "Accept or monitor",
    medium: "Mitigate or transfer",
    high: "Mitigate or transfer",
    critical: "Mitigate or avoid",
  });

  const handleAddLevel = (type: 'likelihood' | 'consequence') => {
    if (type === 'likelihood') {
      setLikelihoodLevels([...likelihoodLevels, {
        id: likelihoodLevels.length + 1,
        level: "New Level",
        description: "Description",
        value: likelihoodLevels.length + 1
      }]);
    } else {
      setConsequenceLevels([...consequenceLevels, {
        id: consequenceLevels.length + 1,
        level: "New Level",
        description: "Description",
        value: consequenceLevels.length + 1
      }]);
    }
  };

  const handleDeleteLevel = (type: 'likelihood' | 'consequence', id: number) => {
    if (type === 'likelihood') {
      setLikelihoodLevels(likelihoodLevels.filter(level => level.id !== id));
    } else {
      setConsequenceLevels(consequenceLevels.filter(level => level.id !== id));
    }
  };

  const handleUpdateLevel = (type: 'likelihood' | 'consequence', id: number, field: string, value: string) => {
    if (type === 'likelihood') {
      setLikelihoodLevels(likelihoodLevels.map(level => 
        level.id === id ? { ...level, [field]: value } : level
      ));
    } else {
      setConsequenceLevels(consequenceLevels.map(level => 
        level.id === id ? { ...level, [field]: value } : level
      ));
    }
  };

  const handleSaveSettings = () => {
    // TODO: Implement API call to save settings
    console.log("Saving risk settings...");
  };

  const renderRiskMatrix = () => {
    const numLikelihood = likelihoodLevels.length;
    const numConsequence = consequenceLevels.length;
    const labelCellStyle = "text-center font-medium p-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 h-full flex flex-col justify-center items-center min-h-[80px]";
    const cellStyle = "p-2 text-center text-white border border-gray-200 dark:border-gray-600 h-full flex flex-col justify-center items-center min-h-[80px]";
    const titleCellStyle = "p-2 text-center font-bold text-lg flex items-center justify-center text-foreground";

    return (
      <div className="space-y-4">
        <div className="grid gap-1 relative" style={{ 
          gridTemplateColumns: `auto 1fr`,
          gridTemplateRows: `auto auto 1fr`,
          paddingLeft: '50px',
          paddingBottom: '50px'
        }}>

          <div 
            className={`${titleCellStyle} absolute left-0 top-0 bottom-[100px] w-[50px]`}
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}
          >
            Consequence
          </div>

          <div 
            className={`${titleCellStyle} absolute bottom-0 left-[50px] right-0 h-[50px]`}
          >
            Likelihood
          </div>

          <div className="contents" style={{ gridColumn: 2, gridRow: 2 }}>
            <div className="grid gap-1" style={{
              gridTemplateColumns: `150px repeat(${numConsequence}, 1fr)`,
              gridTemplateRows: `repeat(${numLikelihood}, auto) auto`,
              alignItems: 'stretch'
            }}>
              
              <div style={{ gridColumn: 1, gridRow: numLikelihood + 1 }}></div>

              {likelihoodLevels.map((likelihood, rowIndex) => (
                <React.Fragment key={`row-${likelihood.id}`}>
                  {consequenceLevels.map((consequence, colIndex) => {
                    const riskScore = likelihood.value * consequence.value;
                    const riskLevel = riskMatrix.find(level => 
                      riskScore >= level.min && riskScore <= level.max
                    );
                    const gridRow = numLikelihood - rowIndex; 
                    return (
                      <div 
                        key={`cell-${likelihood.id}-${consequence.id}`}
                        className={`${cellStyle} ${riskLevel?.color || 'bg-gray-500'}`}
                        style={{ gridColumn: colIndex + 2, gridRow: gridRow}} 
                      >
                        <div className="font-bold text-lg">{riskScore}</div>
                        <div className="text-xs opacity-90">{riskLevel?.level}</div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

              {consequenceLevels.map((consequence, index) => (
                <div 
                  key={consequence.id} 
                  className={labelCellStyle}
                  style={{ gridColumn: 1, gridRow: numLikelihood - index }} 
                >
                  <div className="font-semibold dark:text-gray-100">{consequence.level}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{consequence.description}</div>
                </div>
              ))}

              {likelihoodLevels.map((likelihood, index) => (
                <div 
                  key={likelihood.id} 
                  className={labelCellStyle}
                  style={{ gridColumn: index + 2, gridRow: numLikelihood + 1 }} 
                >
                  <div className="font-semibold dark:text-gray-100">{likelihood.level}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{likelihood.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          {riskMatrix.map((level) => (
            <div key={level.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${level.color}`} />
              <span className="text-sm font-medium text-foreground">{level.level}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/app/risk-management")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <PageHeader 
          title="Risk Settings" 
          description="Configure risk assessment parameters and strategy"
        />
      </div>

      <Tabs defaultValue="matrix" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matrix">
            <Settings className="mr-2 h-4 w-4" />
            Risk Matrix
          </TabsTrigger>
          <TabsTrigger value="levels">
            <Settings className="mr-2 h-4 w-4" />
            Risk Levels
          </TabsTrigger>
          <TabsTrigger value="strategy">
            <Settings className="mr-2 h-4 w-4" />
            Risk Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Matrix Configuration</CardTitle>
              <CardDescription>
                Define the risk matrix used to calculate risk levels based on likelihood and consequence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Min Score</TableHead>
                        <TableHead>Max Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskMatrix.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell className="font-medium">
                            <Input 
                              value={level.level}
                              onChange={(e) => setRiskMatrix(riskMatrix.map(l => 
                                l.id === level.id ? { ...l, level: e.target.value } : l
                              ))}
                            />
                          </TableCell>
                          <TableCell>
                            <div className={`w-4 h-4 rounded-full ${level.color}`} />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={level.min}
                              onChange={(e) => setRiskMatrix(riskMatrix.map(l => 
                                l.id === level.id ? { ...l, min: parseInt(e.target.value) } : l
                              ))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={level.max}
                              onChange={(e) => setRiskMatrix(riskMatrix.map(l => 
                                l.id === level.id ? { ...l, max: parseInt(e.target.value) } : l
                              ))}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Risk Assessment Matrix</h3>
                  {renderRiskMatrix()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Likelihood Levels</CardTitle>
              <CardDescription>
                Define the likelihood levels used in risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {likelihoodLevels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell>
                            <Input 
                              value={level.level}
                              onChange={(e) => handleUpdateLevel('likelihood', level.id, 'level', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={level.description}
                              onChange={(e) => handleUpdateLevel('likelihood', level.id, 'description', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={level.value}
                              onChange={(e) => handleUpdateLevel('likelihood', level.id, 'value', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLevel('likelihood', level.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddLevel('likelihood')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Likelihood Level
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consequence Levels</CardTitle>
              <CardDescription>
                Define the consequence levels used in risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consequenceLevels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell>
                            <Input 
                              value={level.level}
                              onChange={(e) => handleUpdateLevel('consequence', level.id, 'level', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={level.description}
                              onChange={(e) => handleUpdateLevel('consequence', level.id, 'description', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              value={level.value}
                              onChange={(e) => handleUpdateLevel('consequence', level.id, 'value', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteLevel('consequence', level.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddLevel('consequence')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Consequence Level
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Treatment Strategy</CardTitle>
              <CardDescription>
                Define the risk treatment strategy for each risk level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(riskStrategy).map(([level, strategy]) => (
                    <div key={level}>
                      <h3 className="text-sm font-medium mb-2 capitalize">{level} Risk</h3>
                      <Textarea
                        value={strategy}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRiskStrategy({ ...riskStrategy, [level]: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default RiskSettings; 