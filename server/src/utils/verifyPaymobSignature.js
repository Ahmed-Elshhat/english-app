const crypto = require("crypto");

/**
 * Verify Paymob webhook HMAC signature
 * @param {object} req - Express request
 * @returns {boolean} - true if valid, false otherwise
 */
function verifyPaymobSignature(req) {
  try {

    const hmacHeader =
      // eslint-disable-next-line dot-notation
      req.headers["hmac"] || req.headers["Hmac"] || req.headers["HMAC"];
    console.log(req.headers)
    console.log("hmacHeader: ", hmacHeader);

    if (!hmacHeader) return false;

    const secret = process.env.PAYMOB_HMAC_SECRET;
    console.log("secret: ", secret);
    if (!secret) throw new Error("Missing PAYMOB_HMAC_SECRET in .env");

    const obj = req.body.obj;
    console.log("obj: ", obj);
    if (!obj) return false;

    // نفس ترتيب الحقول حسب وثائق Paymob بالضبط
    const concatenatedString =
      obj.id +
      obj.amount_cents +
      obj.created_at +
      obj.currency +
      obj.error_occured +
      obj.has_parent_transaction +
      obj.integration_id +
      obj.is_3d_secure +
      obj.is_auth +
      obj.is_capture +
      obj.is_refunded +
      obj.is_standalone_payment +
      obj.is_voided +
      obj.order.id +
      obj.owner +
      obj.pending +
      obj.source_data.pan +
      obj.source_data.sub_type +
      obj.source_data.type +
      obj.success;

    console.log("concatenatedString: ", concatenatedString);

    const hmac = crypto
      .createHmac("sha512", secret)
      .update(concatenatedString)
      .digest("hex");

    console.log("hmac: ", hmac);

    return hmac === hmacHeader;
  } catch (err) {
    console.error("HMAC Verification failed:", err.message);
    return false;
  }
}

module.exports = verifyPaymobSignature;
