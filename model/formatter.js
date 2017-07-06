sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		statusWf: function(sValue) {
			var bundle = this.getModel("i18n").getResourceBundle();

			switch (sValue) {
				case "A":
					return bundle.getText("approved");
				case "R":
					return bundle.getText("rejected");
				case "E":
					return bundle.getText("error");
				default:
					return bundle.getText("pending");
			}

		}
	};

});