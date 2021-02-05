const axios = require("axios");

const newTransaction = async (req, res) => {
  const { amount } = req.body;
  console.log(amount);
  await axios({
    url:
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.0/transactions",
    headers: {
      "Content-type": "application/json",
      "Tbk-Api-Key-Id": "597055555532",
      "Tbk-Api-Key-Secret":
        "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
    },
    data: {
      buy_order: "ordenCompra12345678",
      session_id: "sesion1234557545",
      amount,
      return_url: "/success",
    },
    method: "POST",
  }).then((data) => {
    const { token } = data.data;
    console.log(token);
    res.send({ token });
  });
};

const successTransaction = (req, res) => {
  const { token_ws: token } = req.body;
  axios({
    url:
      "https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.0/transactions/" +
      token,
    headers: {
      "Content-type": "application/json",
      "Tbk-Api-Key-Id": "597055555532",
      "Tbk-Api-Key-Secret":
        "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
    },
    method: "PUT",
  }).then(async (data) => {
    const details = data.data;
    if (data.data.status !== "AUTHORIZED") {
      res.send("Algo salió mal en la compra...");
    } else {
      try {
        let {
          buy_order: order_number,
          transaction_date: date,
          amount,
          card_detail,
          payment_type_code: payment_type,
        } = details;
        card_detail = card_detail.card_number;
        const trasnactionValues = [
          order_number,
          date,
          amount,
          card_detail,
          payment_type,
        ];

        await addTransaction(trasnactionValues);
        res.redirect(`/`);
      } catch (e) {
        res
          .status(500)
          .send({ error: "500 internal error", message: e.message });
      }
    }
  });
};

module.exports = { newTransaction, successTransaction };
