"use client";
import { redirect, useParams, useSearchParams } from "next/navigation";

const Home = () => {
	return redirect("/new");
};

export default Home;
