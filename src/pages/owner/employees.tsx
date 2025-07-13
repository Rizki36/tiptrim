import React from "react";
import OwnerLayout from "@/components/layouts/OwnerLayout";
import type { NextPageWithLayout } from "../_app";

const EmployeesPage: NextPageWithLayout = () => {
	return <div>EmployeesPage</div>;
};

EmployeesPage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default EmployeesPage;
