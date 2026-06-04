'use client';
import { App as AntdApp, } from 'antd';
import { Fragment, PropsWithChildren, useEffect } from 'react';
import './globals.css';
import RootLayout from './RootLayout';

const ChildLayout = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const el = document.querySelector('.container');
    let timer: NodeJS.Timeout;

    el?.addEventListener('scroll', () => {
      el?.classList.add('show-scrollbar');
      clearTimeout(timer);
      timer = setTimeout(() => {
        el?.classList.remove('show-scrollbar');
      }, 800);
    });
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <RootLayout>
      <AntdApp>
        <ChildLayout>{children}</ChildLayout>
      </AntdApp>
    </RootLayout>
  );
}
