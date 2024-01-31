import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function UserView() {
  return (
    <div className="pl-5 mt-12 text-4xl font-bold">
      <div>Users</div>
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#2FD271]">Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-10">
        <Table>
          <TableHeader className="bg-[#E7F9FD]">
            <TableRow>
              <TableHead className="text-[#1F61AC]">Name</TableHead>
              <TableHead className="text-[#1F61AC]">Wallet ID</TableHead>
              <TableHead className="text-[#1F61AC]">Verified</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Anjali Thakur</TableCell>
              <TableCell>125489</TableCell>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell className="flex justify-end gap-4">
                <Image
                  src="/assets/svg/edit-icon.svg"
                  alt="edit-icon"
                  width={20}
                  height={20}
                />
                <Image
                  src="/assets/svg/delete-icon.svg"
                  alt="edit-icon"
                  width={20}
                  height={20}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
