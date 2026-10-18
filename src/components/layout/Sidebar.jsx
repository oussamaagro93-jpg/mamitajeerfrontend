import React from "react";
import { NavLink } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { AuthContext } from "../../context/AuthContext";
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  UsersIcon,
  ArchiveBoxIcon,
  GiftIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  TruckIcon,
  MapPinIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

class Sidebar extends React.Component {
  render() {
    var t = this.props.t;
    var isRtl = document.documentElement.dir === "rtl";

    var navigation = [
      {
        name: t("nav.dashboard"),
        key: "dashboard",
        href: "/admin",
        icon: HomeIcon,
        badge: "📊",
      },
      {
        name: t("nav.products"),
        key: "products",
        href: "/admin/products",
        icon: CubeIcon,
        badge: "📦",
      },
      {
        name: t("nav.categories"),
        key: "categories",
        href: "/admin/categories",
        icon: TagIcon,
        badge: "🏷️",
      },
      {
        name: t("nav.brands"),
        key: "brands",
        href: "/admin/brands",
        icon: BuildingStorefrontIcon,
        badge: "🏪",
      },
      {
        name: t("nav.orders"),
        key: "orders",
        href: "/admin/orders",
        icon: ShoppingCartIcon,
        badge: "🎁",
      },
      {
        name: t("nav.customers"),
        key: "customers",
        href: "/admin/customers",
        icon: UsersIcon,
        badge: "👥",
      },
      {
        name: t("nav.inventory"),
        key: "inventory",
        href: "/admin/inventory",
        icon: ArchiveBoxIcon,
        badge: "🚚",
      },
      {
        name: t("nav.coupons"),
        key: "coupons",
        href: "/admin/coupons",
        icon: GiftIcon,
        badge: "🎟️",
      },
    ];

    return React.createElement(
      AuthContext.Consumer,
      null,
      function (auth) {
        var user = auth ? auth.user : null;
        var isSuperAdmin =
          user && (user.role === "super_admin" || user.role === "admin");
        var open = this.props.open;
        var setOpen = this.props.setOpen;

        var createNavItem = function (item, isExact) {
          if (isExact === undefined) isExact = false;

          return React.createElement(
            NavLink,
            {
              key: item.key || item.href,
              to: item.href,
              exact: isExact,
              onClick: function () {
                if (setOpen) setOpen(false);
              },
              className:
                "group flex items-center justify-between px-3 py-2.5 my-1 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50",
              activeClassName:
                "bg-gradient-to-r from-blue-600 to-blue-500 !text-white shadow-md shadow-blue-500/20 font-semibold",
            },
            React.createElement(
              "div",
              { className: "flex items-center" },
              React.createElement(item.icon, {
                className:
                  "w-5 h-5 mr-3 flex-shrink-0 opacity-80 group-hover:opacity-100",
              }),
              React.createElement("span", null, item.name),
            ),
            item.badge
              ? React.createElement(
                  "span",
                  {
                    className:
                      "text-xs opacity-90 group-hover:scale-110 transition-transform",
                  },
                  item.badge,
                )
              : null,
          );
        };

        return React.createElement(
          React.Fragment,
          null,
          open
            ? React.createElement("div", {
                className:
                  "fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden",
                onClick: function () {
                  if (setOpen) setOpen(false);
                },
              })
            : null,
          React.createElement(
            "div",
            {
              className:
                "fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-lg lg:shadow-none " +
                (open
                  ? "translate-x-0"
                  : isRtl
                    ? "translate-x-full"
                    : "-translate-x-full"),
            },
            // Header Logo
            React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700",
              },
              React.createElement(
                NavLink,
                { to: "/admin", className: "flex items-center space-x-2.5" },
                React.createElement(
                  "div",
                  {
                    className:
                      "w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20",
                  },
                  React.createElement(
                    "span",
                    { className: "text-white font-bold text-xs" },
                    t("app.logo"),
                  ),
                ),
                React.createElement(
                  "span",
                  {
                    className:
                      "text-xl font-bold text-gray-900 dark:text-white",
                  },
                  t("app.name"),
                ),
              ),
              React.createElement(
                "button",
                {
                  onClick: function () {
                    if (setOpen) setOpen(false);
                  },
                  className:
                    "lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                },
                React.createElement(XMarkIcon, { className: "w-6 h-6" }),
              ),
            ),

            // Nav Items
            React.createElement(
              "nav",
              { className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto" },
              navigation.map(function (item) {
                return createNavItem(item, item.href === "/admin");
              }),

              isSuperAdmin
                ? React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "div",
                      {
                        className:
                          "px-3 pt-4 pb-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider",
                      },
                      t("nav.shipping"),
                    ),
                    createNavItem({
                      name: t("nav.deliveryCompanies"),
                      href: "/admin/shipping/companies",
                      icon: TruckIcon,
                      badge: "🛒",
                    }),
                    createNavItem({
                      name: t("nav.wilayas"),
                      href: "/admin/shipping/wilayas",
                      icon: MapPinIcon,
                      badge: "📍",
                    }),
                    createNavItem({
                      name: t("nav.shippingRates"),
                      href: "/admin/shipping/rates",
                      icon: TruckIcon,
                      badge: "💸",
                    }),
                  )
                : null,

              isSuperAdmin
                ? createNavItem({
                    name: t("nav.users"),
                    href: "/admin/users",
                    icon: UserGroupIcon,
                    badge: "👤",
                  })
                : null,
            ),

            // Settings Section
            React.createElement(
              "div",
              {
                className:
                  "px-3 py-2 border-t border-gray-200 dark:border-gray-700",
              },
              createNavItem({
                name: t("nav.settings"),
                href: "/admin/settings",
                icon: Cog6ToothIcon,
                badge: "🔑",
              }),
            ),

            // Bottom Collapse Menu Bar
            React.createElement(
              "div",
              {
                className:
                  "px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50",
              },
              React.createElement(
                "button",
                {
                  onClick: function () {
                    if (setOpen) setOpen(false);
                  },
                  className:
                    "flex items-center space-x-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                },
                React.createElement(ChevronLeftIcon, { className: "w-4 h-4" }),
                React.createElement("span", null, "Collapse Menu"),
              ),
              React.createElement(
                "div",
                {
                  className:
                    "w-7 h-7 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center text-xs font-bold",
                },
                user && user.name ? user.name.charAt(0).toUpperCase() : "A",
              ),
            ),
          ),
        );
      }.bind(this),
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default withTranslation()(connect(mapStateToProps)(Sidebar));
