import React from 'react';
import { withTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

class DataTable extends React.Component {
  render() {
    var t = this.props.t;
    var columns = this.props.columns || [];
    var data = this.props.data || [];
    var loading = this.props.loading || false;
    var pagination = this.props.pagination;
    var emptyMessage = this.props.emptyMessage || t('common.noData');
    var onPageChange = this.props.onPageChange || function () {};

    return React.createElement('div', { className: 'card' },
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'w-full' },
          React.createElement('thead', null,
            React.createElement('tr', { className: 'divide-x divide-gray-200 dark:divide-gray-700' },
              columns.map(function (col, i) {
                return React.createElement('th', {
                  key: i,
                  className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                }, col.label);
              })
            )
          ),
          React.createElement('tbody', { className: 'divide-y divide-gray-200 dark:divide-gray-700' },
            loading
              ? React.createElement('tr', null,
                  React.createElement('td', { colSpan: columns.length, className: 'px-6 py-12 text-center text-sm text-gray-500' },
                    t('common.loading')
                  )
                )
              : data.length === 0
                ? React.createElement('tr', null,
                    React.createElement('td', { colSpan: columns.length, className: 'px-6 py-12 text-center text-sm text-gray-500' },
                      emptyMessage
                    )
                  )
                : data.map(function (row, rowIndex) {
                    return React.createElement('tr', { key: row.id || rowIndex, className: 'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors' },
                      columns.map(function (col, colIndex) {
                        return React.createElement('td', {
                          key: colIndex,
                          className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300',
                        },
                          col.render ? col.render(row) : row[col.key]
                        );
                      })
                    );
                  })
          )
        )
      ),
      pagination
        ? React.createElement('div', { className: 'flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700' },
            React.createElement('p', { className: 'text-sm text-gray-500' },
              t('common.pageOfTotal', { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total })
            ),
            React.createElement('div', { className: 'flex space-x-2' },
              React.createElement('button', {
                onClick: function () { if (pagination.page > 1) onPageChange(pagination.page - 1); },
                disabled: pagination.page <= 1,
                className: 'btn-secondary !p-2 !rounded-lg disabled:opacity-50',
              },
                React.createElement(ChevronLeftIcon, { className: 'w-4 h-4' })
              ),
              React.createElement('button', {
                onClick: function () { if (pagination.page < pagination.totalPages) onPageChange(pagination.page + 1); },
                disabled: pagination.page >= pagination.totalPages,
                className: 'btn-secondary !p-2 !rounded-lg disabled:opacity-50',
              },
                React.createElement(ChevronRightIcon, { className: 'w-4 h-4' })
              )
            )
          )
        : null
    );
  }
}

export default withTranslation()(DataTable);
