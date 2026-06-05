"use client";
import { ReduxProvider } from "@/redux";
import { App as AntdApp, ConfigProvider } from "antd";
import { Fragment, PropsWithChildren, useEffect } from "react";
import "./globals.css";
import RootLayout from "./RootLayout";

import { setMessageInstance } from "@/utils/helpers";

const AntdMessageExtractor = () => {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    setMessageInstance(message);
  }, [message]);
  return null;
};

const ChildLayout = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const el = document.querySelector(".container");
    let timer: NodeJS.Timeout;

    el?.addEventListener("scroll", () => {
      el?.classList.add("show-scrollbar");
      clearTimeout(timer);
      timer = setTimeout(() => {
        el?.classList.remove("show-scrollbar");
      }, 800);
    });
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <RootLayout>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#4f46e5",
            borderRadius: 8,
            fontFamily: "var(--font-poppins), sans-serif",
          },
        }}
      >
        <AntdApp>
          <AntdMessageExtractor />
          <ReduxProvider>
            <ChildLayout>{children}</ChildLayout>
          </ReduxProvider>
        </AntdApp>
      </ConfigProvider>
    </RootLayout>
  );
}
