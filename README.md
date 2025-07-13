# Barber Shop Application — Functional Requirements

## 1. Data Model (Schema)

```ts
type UUID = string;
type DateTime = string;

interface User {
  id: UUID;
  username: string;
  password: string;
  employeeId?: UUID;
  role: 'owner' | 'employee';
}

interface Employee {
  id: UUID;
  name: string;
  role: 'cashier' | 'barber';
  deletedAt: DateTime | null;
}

interface Product {
  id: UUID;
  name: string;
  price: number;
  category: 'service' | 'product';
  description: string;
  bonusPercentageForBarber: number;
  bonusPercentageForCashier: number;
}

interface Order {
  id: UUID;
  totalPrice: number;
  cashierId: UUID;
  barberId: UUID;
  createdAt: DateTime;
}

interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID;
  productName: string;
  productPrice: number;
  barberBonus: number;
  cashierBonus: number;
  quantity: number;
  payrollStatus: 'pending' | 'paid';
  payrollItemId?: UUID;
}

interface Payroll {
  id: UUID;
  employeeId: UUID;
  periodStart: DateTime;
  periodEnd: DateTime;
  amount: number;
  status: 'draft' | 'paid';
  createdAt: DateTime;
  deletedAt: DateTime | null;
}

interface PayrollItem {
  id: UUID;
  type: 'bonus' | 'salary';
  amount: number;
  payrollId: UUID;
  orderItemId?: UUID;
}
````

---

## 2. Actors & Roles

* **Owner**
  – Can access all features (dashboard, employee management, payroll).
* **Employee**
  – Role `barber`: Provides services and earns commission.
  – Role `cashier`: Creates orders, records transactions, and earns commission.

---

## 3. Use Cases & UI Flows

### 3.1. Cashier Page (Employee – Cashier)

1. **Select Barber (optional)**

   * Dropdown or searchable list showing all employees with role `barber`.
   * Selected `barberId` is stored in `Order.barberId`.
2. **Product Table**

   * Columns:

     * `Name` (Product.name)
     * `Price` (Product.price)
     * `Quantity` (number input)
     * `Total` (price × quantity)
   * “+” button on each row to add an `OrderItem`.
   * Calculate row subtotal & update `Order.totalPrice`.
3. **“Proceed” Button**

   * Validation: at least 1 `OrderItem`.
   * Navigates to **Confirmation Page**.

### 3.2. Confirmation Page

1. **Review Details**

   * Barber’s Name (`Order.barberId` → Employee.name)
   * Cashier’s Name (`Order.cashierId` = current user)
   * List of OrderItems:

     * `productName`, `productPrice`, `quantity`, `total`
2. **Grand Total**

   * `Order.totalPrice`
3. **“Confirm” Button**

   * Save `Order` & all `OrderItems` to the database.
   * Calculate and store `barberBonus` & `cashierBonus` for each `OrderItem`:

     ```js
     barberBonus   = productPrice × quantity × (bonusPercentageForBarber / 100)
     cashierBonus = productPrice × quantity × (bonusPercentageForCashier / 100)
     ```
   * Set `payrollStatus` to `'pending'`.

---

### 3.3. Admin – Dashboard

Display charts & KPIs such as:

* **Total Sales** (daily / weekly / monthly)
* **Average Transaction Value**
* **Top 5 Products** (by revenue)
* **Commissions Paid vs. Pending** (barbers vs. cashiers)
* **Orders Today**
* **Customer Trend** (growth rate)

> *Note: Use bar, line, and pie charts with date-range filters.*

---

### 3.4. Admin – Employee Management

1. **Employee Menu**

   * List employees as **cards**:

     * Photo (optional), `Employee.name`, `role`, “Details” button
   * **“Add”** button → form to create a new employee
2. **Employee Detail Page**

   * **Basic Info**

     * `name`, `role`, `deletedAt`
     * **“Delete”** button (soft delete → set `deletedAt = now()`)
   * **“Details” Tab**

     * Form to update: `name`, `role`, `description` (optional)
   * **“Account” Tab**

     * Form to update `User.username` & `User.password`
   * **“Payroll” Tab**

     * Table of `Payroll` records for this `employeeId`:

       * Columns: `periodStart`, `periodEnd`, `amount`, `status`
       * Link to **Payroll Detail**

---

### 3.5. Admin – Payroll Management

1. **Payroll Menu**

   * **“Add”** button → form to create a new `Payroll`:

     * Select Employee, set `periodStart`, `periodEnd`, `amount` (auto sum of salary + bonuses), `status`
   * **Filters**:

     * Start Date & End Date (date pickers)
     * Status: draft | paid
2. **Payroll Table**

   * Columns: `Employee.name`, `periodStart`, `periodEnd`, `amount`, `status`, “Details” button
   * Sortable & pageable

---

## 4. API Endpoints (Examples)

| Method | Path                | Description               |
| ------ | ------------------- | ------------------------- |
| GET    | /api/products       | List Products             |
| POST   | /api/orders         | Create Order + OrderItems |
| GET    | /api/orders/\:id    | Order Details             |
| GET    | /api/employees      | List Employees            |
| POST   | /api/employees      | Add Employee              |
| GET    | /api/employees/\:id | Employee Details + tabs   |
| PUT    | /api/employees/\:id | Update Employee           |
| DELETE | /api/employees/\:id | Soft Delete Employee      |
| GET    | /api/payrolls       | List Payrolls (+ filters) |
| POST   | /api/payrolls       | Create Payroll            |
| GET    | /api/payrolls/\:id  | Payroll Details + items   |
| PUT    | /api/payrolls/\:id  | Update Payroll status     |

---

## 5. Validation & Business Rules

* **Order** must have at least 1 `OrderItem`.
* **Quantity** in `OrderItem` ≥ 1.
* Soft-deleted employees (with `deletedAt` set) do not appear in default lists.
* **Payroll.amount** = ∑(salary + bonus from attached `OrderItem`s).
* Each `OrderItem.payrollStatus` changes to `'paid'` when its `Payroll` is marked as `paid`.

