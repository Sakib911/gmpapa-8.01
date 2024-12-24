// Previous imports remain the same...

export function Overview() {
  // Previous code remains the same...

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `৳${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border-purple-900/20 bg-gray-900/90 backdrop-blur-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-gray-300">Revenue:</span>
                      <span className="font-bold">{formatCurrency(payload[0].value as number)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-300">Orders:</span>
                      <span className="font-bold">{payload[1].value}</span>
                    </div>
                  </div>
                </Card>
              );
            }
            return null;
          }}
        />
        {/* Rest of the component remains the same... */}
      </LineChart>
    </ResponsiveContainer>
  );
}