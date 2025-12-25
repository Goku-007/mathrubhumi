import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Routes, Route, useNavigate } from "react-router-dom";
import DashboardHome from "./DashboardHome";
import SaleBill from "./Transactions/SaleBill";
import GoodsInward from "./Transactions/GoodsInward";
import SaleBillReturn from "./Transactions/SaleBillReturn";
import PPReceiptEntry from "./Transactions/PPReceiptEntry";
import RemittanceEntry from "./Transactions/RemittanceEntry";
import CreditRealisationEntry from "./Transactions/CreditRealisationEntry";
import GoodsInwardReturn from "./Transactions/GoodsInwardReturn";
import CategoriesMaster from "./Masters/CategoriesMaster";
import SubCategoriesMaster from "./Masters/SubCategoriesMaster";
import PublisherMaster from "./Masters/PublisherMaster";
import AuthorMaster from "./Masters/AuthorMaster";
import TitleMaster from "./Masters/TitleMaster";
import PPBooksMaster from "./Masters/PPBooksMaster";
import PlacesMaster from "./Masters/PlacesMaster";
import SupplierMaster from "./Masters/SupplierMaster";
import CreditCustomerMaster from "./Masters/CreditCustomerMaster";
import PPCustomersMaster from "./Masters/PPCustomersMaster";
import PrivilegersMaster from "./Masters/PrivilegersMaster";
import AgentsMaster from "./Masters/AgentsMaster";
import PurchaseBreakupsMaster from "./Masters/PurchaseBreakupsMaster";
import RoyaltyRecipientsMaster from "./Masters/RoyaltyRecipientsMaster";
import UserManagement from "./Admin/UserManagement";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="goods-inward" element={<GoodsInward />} />
          <Route path="sale-bill" element={<SaleBill />} />
          <Route path="goods-inward-return" element={<GoodsInwardReturn />} />
          <Route path="sale-bill-return" element={<SaleBillReturn />} />
          <Route path="pp-receipt-entry" element={<PPReceiptEntry />} />
          <Route path="remittance-entry" element={<RemittanceEntry />} />
          <Route path="credit-realisation-entry" element={<CreditRealisationEntry />} />
          <Route path="categories-master" element={<CategoriesMaster />} />
          <Route path="sub-categories-master" element={<SubCategoriesMaster />} />
          <Route path="publisher-master" element={<PublisherMaster />} />
          <Route path="author-master" element={<AuthorMaster />} />
          <Route path="title-master" element={<TitleMaster />} />
          <Route path="pp-books-master" element={<PPBooksMaster />} />
          <Route path="places-master" element={<PlacesMaster />} />
          <Route path="supplier-master" element={<SupplierMaster />} />
          <Route path="credit-customer-master" element={<CreditCustomerMaster />} />
          <Route path="pp-customers-master" element={<PPCustomersMaster />} />
          <Route path="privilegers-master" element={<PrivilegersMaster />} />
          <Route path="agents-master" element={<AgentsMaster />} />
          <Route path="purchase-breakups-master" element={<PurchaseBreakupsMaster />} />
          <Route path="royalty-recipients-master" element={<RoyaltyRecipientsMaster />} />
          <Route path="users" element={<UserManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
