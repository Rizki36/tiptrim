import OwnerLayout from "@/components/layouts/OwnerLayout";
import React from "react";
import { NextPageWithLayout } from "../_app";

const PayrollPage: NextPageWithLayout = () => {
	return <div>PayrollPage</div>;
};

PayrollPage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default PayrollPage;
