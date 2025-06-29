import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">shadcn/ui コンポーネント確認</h1>

      <Button>Button</Button>
      <Badge>Badge</Badge>

      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card Content</CardContent>
      </Card>

      <div>
        <Label htmlFor="test-input">Label</Label>
        <Input id="test-input" placeholder="Input" />
      </div>

      <Separator />

      <Tabs defaultValue="tab1" className="w-[300px]">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>

      <Textarea placeholder="Textarea" />
    </div>
  );
}
