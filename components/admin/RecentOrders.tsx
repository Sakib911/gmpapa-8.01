// Previous imports remain the same...

export function RecentOrders() {
  // Previous code remains the same...

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order._id}>
            {/* Previous cells remain the same... */}
            <TableCell className="text-right">
              {formatCurrency(order.total)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}