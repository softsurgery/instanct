import * as Sentry from "@sentry/nextjs";
import type { NextPageContext } from "next";
import type { ErrorProps } from "next/error";
import NextError from "next/error";

const CustomErrorComponent = (props: ErrorProps) => {
  return <NextError statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  // This captures errors on the server-side and sends them to Sentry
  await Sentry.captureUnderscoreErrorException(contextData);
  return NextError.getInitialProps(contextData);
};

export default CustomErrorComponent;
