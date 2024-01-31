import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type CardDataProps = {
  title: string;
  total: number;
  color: string;
};

const cardData: CardDataProps[] = [
  {
    title: 'Total no. of Beneficiaries',
    total: 50,
    color: '#ccF4fe',
  },
  {
    title: 'Total no. of Community',
    total: 10,
    color: '#d3fcd2',
  },
  {
    title: 'Area of Covering',
    total: 5,
    color: '#efd6ff',
  },
];

export default function DashboardView() {
  return (
    <div>
      <div className="pl-5 font-bold text-4xl">Welcome to the Dashboard.</div>
      <div className="px-5 py-12 flex gap-10">
        {cardData.map((item: CardDataProps) => (
          <Card
            key={item.title}
            style={{ backgroundColor: item.color }}
            className={`w-[250px] `}
          >
            <CardHeader>
              <CardTitle className="text-xl h-14">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-4xl">{item.total}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
