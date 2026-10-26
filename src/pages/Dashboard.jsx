import React from "react";
import { withTranslation } from "react-i18next";
import { formatDzd } from "../utils/money";
import {
  BanknotesIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ArrowPathIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardAPI, orderAPI } from "../api";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

var COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatCard(props) {
  var title = props.title;
  var value = props.value;
  var Icon = props.icon;
  var loading = props.loading;
  var onClick = props.onClick;

  return React.createElement(
    onClick ? 'button' : 'div',
    {
      className: 'card p-6 text-left w-full' + (onClick ? ' cursor-pointer hover:shadow-lg transition-shadow' : ''),
      onClick: onClick,
    },
    React.createElement(
      "div",
      { className: "flex items-center justify-between" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          { className: "text-sm text-gray-500 dark:text-gray-400" },
          title,
        ),
        loading
          ? React.createElement("div", { className: "skeleton h-8 w-24 mt-1" })
          : React.createElement(
              "p",
              {
                className:
                  "text-2xl font-bold text-gray-900 dark:text-white mt-1",
              },
              value,
            ),
      ),
      React.createElement(
        "div",
        { className: "p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20" },
        React.createElement(Icon, {
          className: "w-6 h-6 text-primary-600 dark:text-primary-400",
        }),
      ),
    ),
  );
}

function CloudinaryStorageWidget(props) {
  var stats = props.stats;
  var loading = props.loading;
  var error = props.error;
  var onRefresh = props.onRefresh;

  return React.createElement(
    "div",
    { className: "card p-6" },
    React.createElement(
      "div",
      { className: "flex items-center justify-between mb-4" },
      React.createElement(
        "h3",
        {
          className:
            "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2",
        },
        React.createElement(CloudIcon, {
          className: "w-5 h-5 text-primary-600",
        }),
        "Cloudinary Storage",
      ),
      React.createElement(
        "button",
        {
          onClick: onRefresh,
          className:
            "btn-secondary text-sm px-3 py-1.5 flex items-center gap-1",
          disabled: loading,
        },
        React.createElement(ArrowPathIcon, {
          className: "w-4 h-4" + (loading ? " animate-spin" : ""),
        }),
        "Refresh",
      ),
    ),
    error
      ? React.createElement(
          "div",
          {
            className:
              "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm",
          },
          error,
        )
      : null,
    loading
      ? React.createElement(
          "div",
          { className: "space-y-3" },
          React.createElement("div", { className: "skeleton h-16 w-full" }),
          React.createElement("div", { className: "skeleton h-16 w-full" }),
        )
      : null,
    !loading && !error && stats
      ? React.createElement(
          "div",
          { className: "space-y-4" },
          React.createElement(
            "div",
            { className: "grid grid-cols-2 gap-4" },
            React.createElement(
              "div",
              {
                className:
                  "text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg",
              },
              React.createElement(
                "p",
                {
                  className: "text-2xl font-bold text-gray-900 dark:text-white",
                },
                stats.totalImages,
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 dark:text-gray-400" },
                "Total Images",
              ),
            ),
            React.createElement(
              "div",
              {
                className:
                  "text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg",
              },
              React.createElement(
                "p",
                {
                  className: "text-2xl font-bold text-gray-900 dark:text-white",
                },
                stats.storageUsedFormatted,
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 dark:text-gray-400" },
                "Storage Used",
              ),
            ),
            React.createElement(
              "div",
              {
                className:
                  "text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg",
              },
              React.createElement(
                "p",
                {
                  className: "text-2xl font-bold text-gray-900 dark:text-white",
                },
                stats.storageRemainingFormatted,
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 dark:text-gray-400" },
                "Storage Remaining",
              ),
            ),
            React.createElement(
              "div",
              {
                className:
                  "text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg",
              },
              React.createElement(
                "p",
                {
                  className: "text-2xl font-bold text-gray-900 dark:text-white",
                },
                stats.bandwidthUsedFormatted,
              ),
              React.createElement(
                "p",
                { className: "text-xs text-gray-500 dark:text-gray-400" },
                "Bandwidth Used",
              ),
            ),
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-1" },
              React.createElement(
                "span",
                { className: "text-sm text-gray-600 dark:text-gray-400" },
                "Storage Usage",
              ),
              React.createElement(
                "span",
                {
                  className:
                    "text-sm font-medium text-gray-900 dark:text-white",
                },
                stats.storageUsedPercent != null
                  ? stats.storageUsedPercent + "%"
                  : "N/A",
              ),
            ),
            stats.storageUsedPercent != null
              ? React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5",
                  },
                  React.createElement("div", {
                    className:
                      "h-2.5 rounded-full transition-all duration-500 " +
                      (stats.storageUsedPercent > 90
                        ? "bg-red-500"
                        : stats.storageUsedPercent > 75
                          ? "bg-orange-500"
                          : "bg-primary-600"),
                    style: {
                      width: Math.min(stats.storageUsedPercent, 100) + "%",
                    },
                  }),
                )
              : React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5",
                  },
                  React.createElement("div", {
                    className: "h-2.5 rounded-full bg-primary-600",
                    style: { width: "100%" },
                  }),
                ),
            React.createElement(
              "div",
              { className: "flex items-center justify-between mt-1" },
              React.createElement(
                "span",
                { className: "text-xs text-gray-400" },
                stats.storageUsedFormatted + " used",
              ),
              React.createElement(
                "span",
                { className: "text-xs text-gray-400" },
                stats.storageLimitFormatted + " limit",
              ),
            ),
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "flex items-center justify-between mb-1" },
              React.createElement(
                "span",
                { className: "text-sm text-gray-600 dark:text-gray-400" },
                "Bandwidth Usage",
              ),
              React.createElement(
                "span",
                {
                  className:
                    "text-sm font-medium text-gray-900 dark:text-white",
                },
                stats.bandwidthUsedPercent != null
                  ? stats.bandwidthUsedPercent + "%"
                  : "N/A",
              ),
            ),
            stats.bandwidthUsedPercent != null
              ? React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5",
                  },
                  React.createElement("div", {
                    className:
                      "h-2.5 rounded-full transition-all duration-500 " +
                      (stats.bandwidthUsedPercent > 90
                        ? "bg-red-500"
                        : stats.bandwidthUsedPercent > 75
                          ? "bg-orange-500"
                          : "bg-secondary-500"),
                    style: {
                      width: Math.min(stats.bandwidthUsedPercent, 100) + "%",
                    },
                  }),
                )
              : React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5",
                  },
                  React.createElement("div", {
                    className: "h-2.5 rounded-full bg-secondary-500",
                    style: { width: "100%" },
                  }),
                ),
            React.createElement(
              "div",
              { className: "flex items-center justify-between mt-1" },
              React.createElement(
                "span",
                { className: "text-xs text-gray-400" },
                stats.bandwidthUsedFormatted + " used",
              ),
              React.createElement(
                "span",
                { className: "text-xs text-gray-400" },
                stats.bandwidthLimitFormatted + " limit",
              ),
            ),
          ),
          stats.lastUpdated
            ? React.createElement(
                "p",
                {
                  className:
                    "text-xs text-gray-400 dark:text-gray-500 text-right mt-2",
                },
                "Last updated: ",
                new Date(stats.lastUpdated).toLocaleString(),
              )
            : null,
        )
      : null,
  );
}

class Dashboard extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      revenue: [],
      orderStatus: [],
      recentOrders: [],
      topProducts: [],
      isLoading: true,
      cloudinaryStats: null,
      cloudinaryLoading: true,
      cloudinaryError: null,
    };
    this.fetchCloudinaryStats = this.fetchCloudinaryStats.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    var self = this;
    var user = this.context?.user;
    dashboardAPI
      .getStats()
      .then(function (res) {
        var s = res.data.data;
        self.setState({
          stats: s,
          recentOrders: s.recentOrders || [],
          topProducts: s.topProducts || [],
        });
      })
      .catch(function () {
        self.setState({ isLoading: false });
      })
      .finally(function () {
        self.setState({ isLoading: false });
      });
    dashboardAPI
      .getRevenueChart(30)
      .then(function (res) {
        self.setState({ revenue: res.data.data.data || [] });
      })
      .catch(function () {});
    dashboardAPI
      .getOrderStatusDistribution()
      .then(function (res) {
        self.setState({ orderStatus: res.data.data.data || [] });
      })
      .catch(function () {});
    if (user && user.role === "super_admin") {
      this.fetchCloudinaryStats();
    } else {
      this.setState({ cloudinaryLoading: false });
    }
  }

  fetchCloudinaryStats() {
    var self = this;
    self.setState({ cloudinaryLoading: true, cloudinaryError: null });
    dashboardAPI
      .getCloudinaryStats()
      .then(function (res) {
        self.setState({
          cloudinaryStats: res.data.data,
          cloudinaryLoading: false,
          cloudinaryError: null,
        });
      })
      .catch(function () {
        self.setState({
          cloudinaryStats: null,
          cloudinaryLoading: false,
          cloudinaryError:
            "Failed to load Cloudinary statistics. Please try again later.",
        });
      });
  }

  render() {
    var t = this.props.t;
    var stats = this.state.stats || {};
    var revenue = this.state.revenue;
    var orderStatus = this.state.orderStatus;
    var recentOrders = this.state.recentOrders;
    var topProducts = this.state.topProducts;
    var isLoading = this.state.isLoading;
    var cloudinaryStats = this.state.cloudinaryStats;
    var cloudinaryLoading = this.state.cloudinaryLoading;
    var cloudinaryError = this.state.cloudinaryError;
    var user = this.context?.user;

    return React.createElement(
      "div",
      { className: "space-y-6" },
      React.createElement(
        "div",
        { className: "flex items-center justify-between" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "h1",
            { className: "text-2xl font-bold text-gray-900 dark:text-white" },
            t("dashboard.title"),
          ),
          React.createElement(
            "p",
            { className: "text-sm text-gray-500 dark:text-gray-400 mt-1" },
            t("dashboard.subtitle"),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" },
        React.createElement(StatCard, {
          title: t("dashboard.totalRevenue"),
          value: formatDzd(stats.totalRevenue || 0),
          icon: BanknotesIcon,
          loading: isLoading,
          onClick: function () { window.location.href = '/admin/orders'; },
        }),
        React.createElement(StatCard, {
          title: t("dashboard.totalOrders"),
          value: stats.totalOrders || 0,
          icon: ShoppingCartIcon,
          loading: isLoading,
          onClick: function () { window.location.href = '/admin/orders'; },
        }),
        React.createElement(StatCard, {
          title: t("dashboard.totalCustomers"),
          value: stats.totalCustomers || 0,
          icon: UsersIcon,
          loading: isLoading,
          onClick: function () { window.location.href = '/admin/customers'; },
        }),
        React.createElement(StatCard, {
          title: t("dashboard.totalProducts"),
          value: stats.totalProducts || 0,
          icon: CubeIcon,
          loading: isLoading,
          onClick: function () { window.location.href = '/admin/products'; },
        }),
      ),
      user && user.role === "super_admin"
        ? React.createElement(CloudinaryStorageWidget, {
            stats: cloudinaryStats,
            loading: cloudinaryLoading,
            error: cloudinaryError,
            onRefresh: this.fetchCloudinaryStats,
          })
        : null,
      React.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
        React.createElement(
          "div",
          { className: "card p-6 lg:col-span-2" },
          React.createElement(
            "h3",
            {
              className:
                "text-lg font-semibold text-gray-900 dark:text-white mb-4",
            },
            t("dashboard.revenueOverview"),
          ),
          React.createElement(
            "div",
            { className: "h-72" },
            React.createElement(
              ResponsiveContainer,
              { width: "100%", height: "100%" },
              React.createElement(
                AreaChart,
                { data: revenue },
                React.createElement(
                  "defs",
                  null,
                  React.createElement(
                    "linearGradient",
                    { id: "colorRevenue", x1: "0", y1: "0", x2: "0", y2: "1" },
                    React.createElement("stop", {
                      offset: "5%",
                      stopColor: "#3b82f6",
                      stopOpacity: 0.1,
                    }),
                    React.createElement("stop", {
                      offset: "95%",
                      stopColor: "#3b82f6",
                      stopOpacity: 0,
                    }),
                  ),
                ),
                React.createElement(CartesianGrid, {
                  strokeDasharray: "3 3",
                  stroke: "#e2e8f0",
                }),
                React.createElement(XAxis, {
                  dataKey: "date",
                  tick: { fontSize: 12 },
                  stroke: "#94a3b8",
                }),
                React.createElement(YAxis, {
                  tick: { fontSize: 12 },
                  stroke: "#94a3b8",
                }),
                React.createElement(Tooltip, null),
                React.createElement(Area, {
                  type: "monotone",
                  dataKey: "revenue",
                  stroke: "#3b82f6",
                  fill: "url(#colorRevenue)",
                  strokeWidth: 2,
                }),
              ),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "card p-6" },
          React.createElement(
            "h3",
            {
              className:
                "text-lg font-semibold text-gray-900 dark:text-white mb-4",
            },
            t("dashboard.orderStatus"),
          ),
          React.createElement(
            "div",
            { className: "h-64" },
            React.createElement(
              ResponsiveContainer,
              { width: "100%", height: "100%" },
              React.createElement(
                PieChart,
                null,
                React.createElement(
                  Pie,
                  {
                    data: orderStatus,
                    cx: "50%",
                    cy: "50%",
                    innerRadius: 60,
                    outerRadius: 80,
                    dataKey: "count",
                    nameKey: "status",
                    label: true,
                  },
                  orderStatus.map(function (_, index) {
                    return React.createElement(Cell, {
                      key: index,
                      fill: COLORS[index % COLORS.length],
                    });
                  }),
                ),
                React.createElement(Tooltip, null),
              ),
            ),
          ),
          React.createElement(
            "div",
            { className: "mt-4 space-y-2" },
            orderStatus.map(function (item, i) {
              return React.createElement(
                "div",
                {
                  key: item.status,
                  className: "flex items-center justify-between text-sm",
                },
                React.createElement(
                  "span",
                  { className: "flex items-center" },
                  React.createElement("span", {
                    className: "w-2 h-2 rounded-full mr-2",
                    style: { backgroundColor: COLORS[i % COLORS.length] },
                  }),
                  React.createElement(
                    "span",
                    {
                      className: "capitalize text-gray-600 dark:text-gray-400",
                    },
                    item.status,
                  ),
                ),
                React.createElement(
                  "span",
                  { className: "font-medium text-gray-900 dark:text-white" },
                  item.count,
                ),
              );
            }),
          ),
        ),
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
        React.createElement(
          "div",
          { className: "card p-6" },
          React.createElement(
            "div",
            { className: "flex items-center justify-between mb-4" },
            React.createElement(
              "h3",
              {
                className:
                  "text-lg font-semibold text-gray-900 dark:text-white",
              },
              t("dashboard.recentOrders"),
            ),
            React.createElement(
              Link,
              {
                to: "/admin/orders",
                className: "text-sm text-primary-600 hover:text-primary-700",
              },
              t("dashboard.viewAll"),
            ),
          ),
          React.createElement(
            "div",
            { className: "space-y-3" },
            recentOrders.slice(0, 5).map(function (order) {
              return React.createElement(
                Link,
                {
                  key: order.id,
                  to: "/admin/orders/" + order.id,
                  className:
                    "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors",
                },
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "p",
                    {
                      className:
                        "text-sm font-medium text-gray-900 dark:text-white",
                    },
                    order.orderNumber,
                  ),
                  React.createElement(
                    "p",
                    { className: "text-xs text-gray-500" },
                    order.user
                      ? order.user.firstName + " " + order.user.lastName
                      : "",
                  ),
                ),
                React.createElement(
                  "div",
                  { className: "text-right" },
                  React.createElement(
                    "p",
                    {
                      className:
                        "text-sm font-medium text-gray-900 dark:text-white",
                    },
                    formatDzd(order.total),
                  ),
                  React.createElement(
                    "span",
                    {
                      className:
                        "badge " +
                        (order.status === "delivered"
                          ? "badge-success"
                          : order.status === "cancelled"
                            ? "badge-danger"
                            : "badge-warning"),
                    },
                    order.status,
                  ),
                ),
              );
            }),
            !recentOrders || recentOrders.length === 0
              ? React.createElement(
                  "p",
                  { className: "text-sm text-gray-500 text-center py-4" },
                  t("dashboard.noRecentOrders"),
                )
              : null,
          ),
        ),
        React.createElement(
          "div",
          { className: "card p-6" },
          React.createElement(
            "h3",
            {
              className:
                "text-lg font-semibold text-gray-900 dark:text-white mb-4",
            },
            t("dashboard.topProducts"),
          ),
          React.createElement(
            "div",
            { className: "space-y-3" },
            topProducts.slice(0, 5).map(function (product) {
              return React.createElement(
                "div",
                {
                  key: product.id,
                  className:
                    "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30",
                },
                React.createElement(
                  "div",
                  { className: "flex items-center space-x-3" },
                  React.createElement(
                    "div",
                    {
                      className:
                        "w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center",
                    },
                    React.createElement(CubeIcon, {
                      className: "w-5 h-5 text-gray-400",
                    }),
                  ),
                  React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "p",
                      {
                        className:
                          "text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]",
                      },
                      product.name,
                    ),
                    React.createElement(
                      "p",
                      { className: "text-xs text-gray-500" },
                      product.sku,
                    ),
                  ),
                ),
                React.createElement(
                  "p",
                  {
                    className:
                      "text-sm font-medium text-gray-900 dark:text-white",
                  },
                  t("dashboard.inStock", { quantity: product.quantity }),
                ),
              );
            }),
            !topProducts || topProducts.length === 0
              ? React.createElement(
                  "p",
                  { className: "text-sm text-gray-500 text-center py-4" },
                  t("dashboard.noProductsYet"),
                )
              : null,
          ),
        ),
      ),
    );
  }
}

export default withTranslation()(Dashboard);
