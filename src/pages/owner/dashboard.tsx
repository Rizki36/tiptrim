import React from "react";
import OwnerLayout from "../../components/layouts/OwnerLayout";
import type { NextPageWithLayout } from "../_app";

const DashboardPage: NextPageWithLayout = () => {
	return <></>;
};

DashboardPage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default DashboardPage;
