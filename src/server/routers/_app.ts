import { router } from "../trpc";
import { employeeRouter } from "./employee";
import { orderRouter } from "./order";
import { payrollRouter } from "./payroll";
import { productRouter } from "./product";

export const appRouter = router({
	employees: employeeRouter,
	products: productRouter,
	orders: orderRouter,
	payrolls: payrollRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
