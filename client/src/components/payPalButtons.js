import { useEffect, useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectTotalCartPrice } from "../redux/cartPricesSlice";
import SuccessfulPayment from "./successfulPayment";

// These values are the props in the UI
const currency = "SEK";
const style = { layout: "vertical" };

// Custom component to wrap the PayPalButtons and handle currency changes
const ButtonWrapper = ({ currency, showSpinner }) => {
  const amount = useAppSelector(selectTotalCartPrice);
  const [successfulPayment, setSuccessfulPayment] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");

  // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
  // This is the main reason to wrap the PayPalButtons in a new component
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
    dispatch({
      type: "resetOptions",
      value: {
        ...options,
        currency: currency,
      },
    });
  }, [currency, showSpinner]);

  let conditionalRender;
  return (
    <>
      {showSpinner && isPending && <div className="spinner" />}
      {successfulPayment ? <SuccessfulPayment payerEmail={payerEmail} /> : null}
      <PayPalButtons
        style={style}
        disabled={false}
        forceReRender={[amount, currency, style]}
        fundingSource={undefined}
        createOrder={(data, actions) => {
          return actions.order
            .create({
              purchase_units: [
                {
                  amount: {
                    currency_code: currency,
                    value: amount,
                  },
                },
              ],
            })
            .then((orderId) => {
              // Your code here after create the order
              return orderId;
            });
        }}
        onApprove={function (data, actions) {
          return actions.order.capture().then(function (details) {
            setSuccessfulPayment(true);
            setPayerEmail(details.payer.email_address);

            // Your code here after capture the order
          });
        }}
      />
    </>
  );
};

export default function PayPalButtonsContainer(cartPrice) {
  return (
    <div
      style={{ maxWidth: "485px", minHeight: "200px", margin: "3rem  auto" }}
    >
      <PayPalScriptProvider
        options={{
          "client-id":
            "AZ2bQOkOlpKmT7dbXsyYGpbS-W5E00RRyB5uP2pSJ8zLvljQVJpQOUjq09IkW18eXlEkib6_kxbuUOT-",
          components: "buttons",
          currency: "SEK",
        }}
      >
        <ButtonWrapper
          currency={currency}
          showSpinner={false}
          amount={cartPrice}
        />
      </PayPalScriptProvider>
    </div>
  );
}
