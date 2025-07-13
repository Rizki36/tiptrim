import React from "react";
import { NextPageWithLayout } from "../_app";
import OwnerLayout from "@/components/layouts/OwnerLayout";

const EmployeesPage: NextPageWithLayout = () => {
	return <div>EmployeesPage</div>;
};

EmployeesPage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default EmployeesPage;
