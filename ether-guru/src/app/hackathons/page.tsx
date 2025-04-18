import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { ExternalLink, Trophy, ShieldCheck } from 'lucide-react';

interface ListItem {
  name: string;
  description: string;
  url: string;
  type: 'hackathon' | 'bounty';
}

const hackathonList: ListItem[] = [
  { name: "ETHGlobal Online", description: "Regular online hackathons with various tracks.", url: "https://ethglobal.com/", type: 'hackathon' },
  { name: "Devfolio Hackathons", description: "Platform hosting numerous web3 hackathons.", url: "https://devfolio.co/hackathons", type: 'hackathon' },
  { name: "ETHDenver", description: "Major annual Ethereum event and hackathon.", url: "https://www.ethdenver.com/", type: 'hackathon' },
];

const bountyList: ListItem[] = [
  { name: "Sherlock", description: "Audit competitions and bug bounties.", url: "https://sherlock.xyz/", type: 'bounty' },
  { name: "Code4rena (C4)", description: "Competitive audit platform.", url: "https://code4rena.com/", type: 'bounty' },
  { name: "Immunefi", description: "Leading bug bounty platform for web3.", url: "https://immunefi.com/", type: 'bounty' },
  { name: "Hats Finance", description: "Decentralized cybersecurity network.", url: "https://hats.finance/", type: 'bounty' },
];

const renderListItem = (item: ListItem) => (
   <Card key={item.name} className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-lg font-medium flex items-center gap-2">
        {item.type === 'hackathon' ? <Trophy className="w-5 h-5 text-yellow-500" /> : <ShieldCheck className="w-5 h-5 text-green-500" />}
        {item.name}
      </CardTitle>
      <Link href={item.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
        <ExternalLink className="h-4 w-4" />
      </Link>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </CardContent>
  </Card>
);

export default function HackathonsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Hackathons & Audit Bounties</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-600" /> Upcoming & Ongoing Hackathons</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hackathonList.map(renderListItem)}
          {/* Add a placeholder card */}
           <Card className="border-dashed border-muted-foreground">
             <CardHeader><CardTitle className="text-muted-foreground">More soon...</CardTitle></CardHeader>
             <CardContent><p className="text-sm text-muted-foreground">Checking for more events.</p></CardContent>
           </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-green-600" /> Audit Bounty Platforms</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bountyList.map(renderListItem)}
        </div>
      </section>
    </div>
  );
}
