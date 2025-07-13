import React from "react";
import OwnerLayout from "../../components/layouts/OwnerLayout";
import { NextPageWithLayout } from "../_app";

const DashboardPage: NextPageWithLayout = () => {
	return (
		<>
			<h1>Owner Dashboard</h1>
			{/* Dashboard content */}
		</>
	);
};

DashboardPage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default DashboardPage;
