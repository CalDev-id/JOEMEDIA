import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SignIn from "./auth/signin/page";
import HomePage from "./home/page";

export const metadata: Metadata = {
  title:
    "Joe Media",
  description: "Joe Media is a news portal that provides the latest updates on various topics including technology, entertainment, sports, and more.",
};

export default function Home() {
  return (
    <>
      {/* <DefaultLayout>
        <ECommerce />
      </DefaultLayout> */}
      {/* <SignIn /> */}
      {/* <Home /> */}
      <HomePage />
    </>
  );
}
