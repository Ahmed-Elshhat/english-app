import Header from "@/components/Header/Header";
import "./plans.scss";
import { BsSnow } from "react-icons/bs";
import { FaSnowflake } from "react-icons/fa";
import { RiTimerFlashLine } from "react-icons/ri";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

function PlansPage() {
  return (
    <div className="Plans">
      <Header />

      <h2>Plans</h2>

      <div className="plans_container">
        {/* Plan 1 - Buy Points */}
        <div className="plan_card points">
          <div className="icon">
            <RiTimerFlashLine />
          </div>
          <h2>Buy Points</h2>
          <p className="price">$10 / 100 points</p>
          <button>subscribe now</button>
          <hr />
          <ul>
            <li>
              <IoMdCheckmarkCircleOutline /> Access to core features
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Email support only
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Standard performance speed
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Single device access
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Basic updates included
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> 5GB storage space
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Limited transactions per month
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Basic templates and layouts
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Essential analytics reports
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Affordable starter plan
            </li>
          </ul>
        </div>

        {/* Plan 3 - Premium Plus */}
        <div className="plan_card premium_plus featured">
          <div className="icon">
            <FaSnowflake />
          </div>
          <h2>Premium Plus</h2>
          <p className="price">$25 / month</p>
          <button>subscribe now</button>
          <hr />
          <ul>
            <li>
              <IoMdCheckmarkCircleOutline /> All Basic features included
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Email & live chat support
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Access on up to 3 devices
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> 50GB storage space
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Double monthly transactions
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> More customization options
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Third-party integrations
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Advanced analytics reports
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Early access to updates
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Exclusive discounts & rewards
            </li>
          </ul>
        </div>

        {/* Plan 2 - Premium */}
        <div className="plan_card premium">
          <div className="icon">
            <div className="cover">
              <BsSnow />
            </div>
          </div>
          <h2>Premium</h2>
          <p className="price">$15 / month</p>
          <button>subscribe now</button>
          <hr />
          <ul>
            <li>
              <IoMdCheckmarkCircleOutline /> All Premium features included
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> 24/7 VIP customer support
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Unlimited device access
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> 1TB cloud storage
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Unlimited monthly transactions
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Access to all premium templates
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> AI-powered detailed analytics
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Extra security features (2FA &
              backup)
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Priority access to new features
            </li>
            <li>
              <IoMdCheckmarkCircleOutline /> Exclusive perks & gifts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PlansPage;
