sap.ui.define(["com/grifols/pp/wf/materials/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/Button", "sap/m/Dialog",
	"sap/m/MessageBox"

], function(BaseController, JSONModel, Button, Dialog, MessageBox) {
	"use strict";

	return BaseController.extend("com.grifols.pp.wf.materials.controller.CreateEntity", {

		_oBinding: {},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Importamos el objeto de value help
			jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");

			var that = this;
			this.oComponent = this.getOwnerComponent();
			this._oODataModel = this.oComponent.getModel();
			this._oResourceBundle = this.getResourceBundle();
			this._oViewModel = new JSONModel({
				enableCreate: false,
				delay: 0,
				busy: false,
				mode: "create",
				viewTitle: ""
			});
			this.setModel(this._oViewModel, "viewModel");

			this.getRouter().getTargets().getTarget("create").attachDisplay(null, this._onDisplay, this);

			// Register the view with the message manager
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			var oMessagesModel = sap.ui.getCore().getMessageManager().getMessageModel();
			this._oBinding = new sap.ui.model.Binding(oMessagesModel, "/", oMessagesModel.getContext("/"));
			this._oBinding.attachChange(function(oEvent) {
				var aMessages = oEvent.getSource().getModel().getData();
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						that._oViewModel.setProperty("/enableCreate", false);
					}
				}
			});

			// Leemos las unidades de medida
			this.oUoM = new sap.ui.model.json.JSONModel();

			// Leemos las divisiones
			this.oDivision = new sap.ui.model.json.JSONModel();
			this.getDivision();

			// Cargamos los idiomas
			this.oLangs = new sap.ui.model.json.JSONModel();
			this.oLangs.setSizeLimit(500);
			this.getLanguages();

			// Cargamos los centros
			this.oWerks = new sap.ui.model.json.JSONModel();
			this.getPlants();

			// Cargamos los centros
			this.oBukrs = new sap.ui.model.json.JSONModel();
			this.oBukrs.setSizeLimit(600);
			this.getBukrs();

			// Cargamos las monedas
			this.oCurr = new sap.ui.model.json.JSONModel();
			this.oCurr.setSizeLimit(500);
			this.getCurrencies();

			// Cargamos las line of business
			this.oLineBusiness = new sap.ui.model.json.JSONModel();
			this.oLineBusiness.setSizeLimit(500);
			this.getLineBusiness();

			// Cargamos los lifnr
			this.oLifnr = new sap.ui.model.json.JSONModel();
			this.oLifnr.setSizeLimit(50);

			// Inicializamos los campos para que este escondidos
			//	this.onInitFields();
		},

		getLabor: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/ParameterSet('ZPP_LABOR')", {
				async: false,
				success: function(oData, oResponse) {},
				error: function(oResponse) {
					that.bErrorLabor = true;
				}
			});

		},

		getUoM: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/UoMSet", {
				async: false,
				success: function(oData, oResponse) {
					that.oUoM.setData(oData.results);
					that.getView().setModel(that.oUoM, "UoMM");
				}
			});
		},

		getPlants: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/PlantSet", {
				async: false,
				success: function(oData, oResponse) {
					that.oWerks.setData(oData.results);
					that.getView().setModel(that.oWerks, "Plants");
				}
			});
		},

		getBukrs: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/BukrsSet", {
				async: false,
				success: function(oData, oResponse) {
					that.oBukrs.setData(oData.results);
					that.getView().setModel(that.oBukrs, "Bukrs");
				}
			});
		},

		getLanguages: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/LanguageSet", {
				async: false,
				success: function(oData, oResponse) {
					that.oLangs.setData(oData.results);
					that.getView().setModel(that.oLangs, "Langs");
				}
			});
		},

		getCurrencies: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/CurrencySet", {
				async: false,
				success: function(oData, oResponse) {
					that.oCurr.setData(oData.results);
					that.getView().setModel(that.oCurr, "Curr");
				}
			});

		},

		getDivision: function() {
			var that = this;
			this.getOwnerComponent().getModel().read("/DivisionSet", {
				async: false,
				success: function(oData, oResponse) {
					that.oDivision.setData(oData.results);
					that.getView().setModel(that.oDivision, "Division");
				}
			});
		},

		getLineBusiness: function() {
			var that = this;
			this.getOwnerComponent().getModel().read("/LineOfBusinessSet", {
				async: false,
				success: function(oData, oResponse) {
					that.oLineBusiness.setData(oData.results);
					that.getView().setModel(that.oLineBusiness, "LineOfBusiness");
				}
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onChangePlant: function() {

			var vPlant = this.getView().byId("Werks_id").getSelectedKey();
			var oFilter = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, vPlant);
			var oFilter1 = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, "");

			var oFilterLine = new sap.ui.model.Filter([oFilter, oFilter1], false);
			//get line of business

			this.getView().byId("Zzlnegocio_box_id").getBinding("items").filter(oFilterLine);

			this._validateSaveEnablement();

		},

		/**
		 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user. 
		 * @function
		 * @public
		 */
		onCopyPetition: function() {

			this.copyPetition = new sap.ui.model.json.JSONModel();

			var that = this;

			var sPetition = this.getView().byId("petition_id").getValue();

			if (sPetition !== "") {

				this.getOwnerComponent().getModel().read("/MaterialSet('" + sPetition + "')", {
					async: false,
					success: function(oData, oResponse) {

						that.peticion.setData(oData);

						// delete values from variables and set visibility
						that.peticion.getData().Zzpeticion = '';

						that.setVisibleOrNo("ZzmatnrSubs_id", oData.ZzmatnrSubs);
						that.setVisibleOrNo("Other_division_id", oData.ZzdivOthers);
						// Arbol decision
						that.setVisibleOrNo("ZzprodAcab_box_id", oData.ZzprodAcab);
						that.setVisibleOrNo("Zzestructura_box_id", oData.Zzestructura);
						that.setVisibleOrNo("ZztipoMat_box_id", oData.ZztipoMat);
						that.setVisibleOrNo("ZzfabInt_box_id", oData.ZzfabInt);
						that.setVisibleOrNo("ZzdgLegal_box_id", oData.ZzdgLegal);
						that.setVisibleOrNo("ZzestanEspecDg_box_id", oData.ZzestanEspecDg);
						that.setVisibleOrNo("ZzctrlCalidad_box_id", oData.ZzctrlCalidad);
						that.setVisibleOrNo("Zzbiologico_box_id", oData.Zzbiologico);
						that.setVisibleOrNo("Zzdisenyo_box_id", oData.Zzdisenyo);

						that._validateSaveEnablement();

					},
					error: function(response) {
						that.onMessageErrorDialogPress();
					}
				});

				this.getOwnerComponent().getModel().read("/MaterialSet('" + sPetition + "')/goToText", {
					async: false,
					success: function(oData, oResponse) {
						var i;
						that.peticion.getData().goToText = [];

						for (i in oData.results) {
							var oRow = {
								"Spras": oData.results[i].Spras,
								"Maktx": oData.results[i].Maktx
							};
							that.peticion.getData().goToText.push(oRow);
						}
						that.getView().getModel("Peticion").refresh(true);
					}
				});
				that.getView().getModel("Peticion").refresh(true);
			}

		},

		setVisibleOrNo: function(sID, sValue) {
			if (sValue === "") {
				this.getView().byId(sID).setVisible(false);
				this.getView().byId(sID + "_lbl").setVisible(false);
				this.getView().byId(sID + "_lbl").setRequired(false);
			} else {
				this.getView().byId(sID).setVisible(true);
				this.getView().byId(sID + "_lbl").setVisible(true);
				this.getView().byId(sID + "_lbl").setRequired(true);
			}

		},

		onMessageErrorDialogPress: function() {
			var that = this;

			var dialog = new Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: that._oResourceBundle.getText("petitionErrorCopy")
				}),
				beginButton: new Button({
					text: 'OK',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},

		onSave: function() {
			var that = this;

			// Deshabilitamos el botón de guardar, para evitar multi creación
			this._oViewModel.setProperty("/enableCreate", false);

			this._oODataModel.create("/MaterialSet", this.peticion.getData(), {
				success: function(response) {

					that._oViewModel.setProperty("/enableCreate", true);
					sap.m.MessageBox.success(that._oResourceBundle.getText("petitionHasBeenCreated"), {
						//	title: "Success", // default
						onClose: function(oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								that._oODataModel.deleteCreatedEntry(that.oContextCreated);
								that._showDetail(response.Zzpeticion);
							}
						},
						styleClass: that.oComponent.getContentDensityClass()
					});
				},
				error: function(response) {
					that._oViewModel.setProperty("/enableCreate", true);
				}
			});

		},

		_checkIfBatchRequestSucceeded: function(oEvent) {
			var oParams = oEvent.getParameters();
			var aRequests = oEvent.getParameters().requests;
			var oRequest;
			if (oParams.success) {
				if (aRequests) {
					for (var i = 0; i < aRequests.length; i++) {
						oRequest = oEvent.getParameters().requests[i];
						if (!oRequest.success) {
							return false;
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Event handler (attached declaratively) for the view cancel button. Asks the user confirmation to discard the changes. 
		 * @function
		 * @public
		 */
		onCancel: function() {
			// check if the model has been changed
			if (this.getModel().hasPendingChanges()) {
				// get user confirmation first
				this._showConfirmQuitChanges(); // some other thing here....
			} else {
				this.getModel("appView").setProperty("/addEnabled", true);
				// cancel without confirmation
				this._navBack();
			}
		},

		setBoxState: function(comboId, comboLabel, bValue) {

			this.getView().byId(comboId).setVisible(bValue);
			this.getView().byId(comboLabel).setVisible(bValue);
			this.getView().byId(comboLabel).setRequired(bValue);
			if (bValue === false) {
				this.getView().byId(comboId).setSelectedKey("");
				this.getView().byId(comboId).setValue("");

				var aValues = comboId.split("_");
				this.peticion.getData()[aValues[0]] = "";
			}

		},

		setInputState: function(inputId, inputLabel, bValue) {

			this.getView().byId(inputId).setVisible(bValue);
			this.getView().byId(inputLabel).setVisible(bValue);
			this.getView().byId(inputLabel).setRequired(bValue);
			if (bValue === false) {
				this.getView().byId(inputId).setValue("");
			}

		},

		onInitFields: function() {
			// Mateial substituto
			this.getView().byId("ZzmatnrSubs_id").setVisible(false);
			this.getView().byId("ZzmatnrSubs_id_lbl").setVisible(false);
			this.getView().byId("ZzmatnrSubs_id_lbl").setRequired(false);

			// Division otros
			this.getView().byId("Other_division_id").setVisible(false);
			this.getView().byId("Other_division_id_lbl").setVisible(false);
			this.getView().byId("Other_division_id_lbl").setRequired(false);

			// ¿Se fabrica interamente o se compra?
			this.getView().byId("ZzfabInt_box_id").setVisible(false);
			this.getView().byId("ZzfabInt_box_id_lbl").setVisible(false);
			this.getView().byId("ZzfabInt_box_id_lbl").setRequired(false);

			// ¿Tiene o puede tener estructura?
			this.getView().byId("Zzestructura_box_id").setVisible(false);
			this.getView().byId("Zzestructura_box_id_lbl").setVisible(false);
			this.getView().byId("Zzestructura_box_id_lbl").setRequired(false);

			// ¿Es DG el fabricante legal?
			this.getView().byId("ZzdgLegal_box_id").setVisible(false);
			this.getView().byId("ZzdgLegal_box_id_lbl").setVisible(false);
			this.getView().byId("ZzdgLegal_box_id_lbl").setRequired(false);

			// ¿Es un producto estándar o específico de DG?
			this.getView().byId("ZzestanEspecDg_box_id").setVisible(false);
			this.getView().byId("ZzestanEspecDg_box_id_lbl").setVisible(false);
			this.getView().byId("ZzestanEspecDg_box_id_lbl").setRequired(false);

			// Tipo Material
			this.getView().byId("ZztipoMat_box_id").setVisible(false);
			this.getView().byId("ZztipoMat_box_id_lbl").setVisible(false);
			this.getView().byId("ZztipoMat_box_id_lbl").setRequired(false);

			// ¿Ha de tener control de calidad? 
			this.getView().byId("ZzctrlCalidad_box_id").setVisible(false);
			this.getView().byId("ZzctrlCalidad_box_id_lbl").setVisible(false);
			this.getView().byId("ZzctrlCalidad_box_id_lbl").setRequired(false);

			// ¿Es biológico?
			this.getView().byId("Zzbiologico_box_id").setVisible(false);
			this.getView().byId("Zzbiologico_box_id_lbl").setVisible(false);
			this.getView().byId("Zzbiologico_box_id_lbl").setRequired(false);

			// Diseño
			this.getView().byId("Zzdisenyo_box_id").setVisible(false);
			this.getView().byId("Zzdisenyo_box_id_lbl").setVisible(false);
			this.getView().byId("Zzdisenyo_box_id_lbl").setRequired(false);

		},

		onMaterialSubstitution: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');

			if (sKey === "Y") {
				this.setInputState("ZzmatnrSubs_id", "ZzmatnrSubs_id_lbl", true);
			} else {
				this.setInputState("ZzmatnrSubs_id", "ZzmatnrSubs_id_lbl", false);
			}

			this._validateSaveEnablement();

		},

		onDivision: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');

			if (sKey === "OTHERS") {
				this.setInputState("Other_division_id", "Other_division_id_lbl", true);
			} else {
				this.setInputState("Other_division_id", "Other_division_id_lbl", false);
			}

			this._validateSaveEnablement();

		},

		onFinishedProduct: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');

			// Inicializamos los valores por cambio de valor
			// Rama Si
			this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", false);
			this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", false);

			// Rama No
			this.setBoxState("Zzestructura_box_id", "Zzestructura_box_id_lbl", false);
			this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
			this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);
			this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);
			this.setBoxState("Zzdisenyo_box_id", "Zzdisenyo_box_id_lbl", false);
			this.setBoxState("ZztipoMat_box_id", "ZztipoMat_box_id_lbl", false);

			if (sKey === "Y") {
				this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", true);
				this.setBoxState("Zzestructura_box_id", "Zzestructura_box_id_lbl", false);

			} else {
				this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", false);
				this.setBoxState("Zzestructura_box_id", "Zzestructura_box_id_lbl", true);
			}

			this._validateSaveEnablement();
		},

		onHasStructure: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');

			// Reiniciamos los valores por cambio
			this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
			this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);
			this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);
			this.setBoxState("Zzdisenyo_box_id", "Zzdisenyo_box_id_lbl", false);
			this.setBoxState("ZztipoMat_box_id", "ZztipoMat_box_id_lbl", false);

			if (sKey === "Y") {
				this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", true);
				this.setBoxState("ZztipoMat_box_id", "ZztipoMat_box_id_lbl", false);
			} else {
				this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", false);
				this.setBoxState("ZztipoMat_box_id", "ZztipoMat_box_id_lbl", true);
			}

			this._validateSaveEnablement();
		},

		onInternallyManufactured: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');
			var sKeyFinishedProduct = this.getView().byId("ZzprodAcab_box_id").getSelectedKey();
			var sTipoMat = this.getView().byId("ZztipoMat_box_id").getSelectedKey();
			var sStandard = this.getView().byId("ZzestanEspecDg_box_id").getSelectedKey();

			this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);
			this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", false);

			if (sTipoMat === "ROH") {
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);
			}

			if (sTipoMat === "ROH" && sStandard === "S" && sKey === "P") {
				this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", false);
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", true);

			} else if (sTipoMat === "ROH") {
				this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", false);
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);

			} else if (sKeyFinishedProduct === "Y" && sKey === "P") {
				this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", true);
				this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
			} else if (sKeyFinishedProduct === "N" && sKey === "P") {
				this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", false);
				this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", true);
			} else {
				this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
				this.setBoxState("ZzdgLegal_box_id", "ZzdgLegal_box_id_lbl", false);
			}

			this._validateSaveEnablement();
		},

		onStandardOrSpecific: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');
			var sTipoMat = this.getView().byId("ZztipoMat_box_id").getSelectedKey();

			this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);
			this.setBoxState("Zzdisenyo_box_id", "Zzdisenyo_box_id_lbl", false);
			if (sTipoMat === "ROH") {
				this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", false);
			}

			if (sTipoMat === "ROH") {
				this.setBoxState("ZzfabInt_box_id", "ZzfabInt_box_id_lbl", true);
			} else if (sKey === "S") {
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", true);
			} else {
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);

				// Si el tipo de material es LEER
				if (sTipoMat === "LEER") {
					this.setBoxState("Zzdisenyo_box_id", "Zzdisenyo_box_id_lbl", true);
				} else {
					this.setBoxState("Zzdisenyo_box_id", "Zzdisenyo_box_id_lbl", false);
				}

			}

			this._validateSaveEnablement();
		},

		onQualityControl: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');
			var sTipoMat = this.getView().byId("ZztipoMat_box_id").getSelectedKey();

			// Inicializamos el valor por cambio de valor
			this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);

			if (sKey === "Y" && sTipoMat !== "LEER" && sTipoMat !== "HIBE") {
				this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", true);
			} else {
				this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);
			}

			this._validateSaveEnablement();
		},

		onMaterialType: function(oEvent) {
			var sKey = oEvent.getParameter('selectedItem').getProperty('key');

			// Incializamos los valores que van por debajo en el arbol
			this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
			this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);
			this.setBoxState("Zzbiologico_box_id", "Zzbiologico_box_id_lbl", false);
			this.setBoxState("Zzdisenyo_box_id", "Zzdisenyo_box_id_lbl", false);

			if (sKey === "ROH" || sKey === "LEER") {
				this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", true);
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);

			} else if (sKey === "HIBE") {
				this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", true);
			} else {
				this.setBoxState("ZzestanEspecDg_box_id", "ZzestanEspecDg_box_id_lbl", false);
				this.setBoxState("ZzctrlCalidad_box_id", "ZzctrlCalidad_box_id_lbl", false);
			}

			this._validateSaveEnablement();
		},

		onOthersComboBox: function(oEvent) {
			this._validateSaveEnablement();
		},

		onValueHelpRequestUoM: function(oEvent) {

			var that = this;
			var sField = oEvent.getSource().getProperty('name');

			this.oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({

				title: this.getResourceBundle().getText("uom"),
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				key: "Msehi",
				descriptionKey: "Msehl",
				stretch: sap.ui.Device.system.phone,

				ok: function(oControlEvent) {
					that.aTokens = oControlEvent.getParameter("tokens");
					var valor = that.aTokens[0].getProperty("key");
					that.getView().byId(sField + "_id").setValue(valor);
					that.oValueHelpDialog.close();
				},

				cancel: function(oControlEvent) {
					that.oValueHelpDialog.close();
				},

				afterClose: function() {
					that.oValueHelpDialog.destroy();
					that.oValueHelpDialog = null;
				}
			});

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
					label: this.getResourceBundle().getText("uom"),
					template: "Msehi"
				}, {
					label: this.getResourceBundle().getText("description"),
					template: "Msehl",
					demandPopin: true
				}]
			});
			this.oValueHelpDialog.getTable().setModel(oColModel, "columns");

			if (this.oValueHelpDialog.getTable().bindRows) {
				this.oValueHelpDialog.getTable().bindRows("/");
			}
			if (this.oValueHelpDialog.getTable().bindItems) {
				var oTable = this.oValueHelpDialog.getTable();

				oTable.bindAggregation("items", "/", function(sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;

					return new sap.m.ColumnListItem({
						cells: aCols.map(function(column) {
							var colname = column.template;
							return new sap.m.Label({
								text: "{" + colname + "}"
							});
						})
					});
				});
			}

			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: false,
				filterBarExpanded: true,
				showFilterConfiguration: false,
				showGoOnFB: !sap.ui.Device.system.phone,
				filterItems: [
					new sap.ui.comp.filterbar.FilterItem({
						name: "Msehi",
						label: this.getResourceBundle().getText("uom"),
						control: new sap.m.Input({
							submit: function() {
								that.oValueHelpDialog.getFilterBar().search();
							}
						})

					}),
					new sap.ui.comp.filterbar.FilterItem({
						name: "Msehl",
						label: this.getResourceBundle().getText("description"),
						control: new sap.m.Input({
							submit: function() {
								that.oValueHelpDialog.getFilterBar().search();
							}
						})
					})
				],

				search: function(oEventSearch) {

					var aOdataFilters = oEventSearch.getParameter("selectionSet");
					var aFilters = [
						new sap.ui.model.Filter("Msehi", sap.ui.model.FilterOperator.EQ, aOdataFilters[0].getValue().toString().toUpperCase()),
						new sap.ui.model.Filter("Msehl", sap.ui.model.FilterOperator.EQ, aOdataFilters[1].getValue())
					];

					that.getOwnerComponent().getModel().read("/UoMSet", {
						filters: aFilters,
						async: false,
						success: function(oData, oResponse) {
							that.oUoM.setData(oData.results);
							that.oValueHelpDialog.getTable().setModel(that.oUoM);
							that.oValueHelpDialog.getTable().bindRows("/");
							that.oValueHelpDialog.update();
						}
					});

				}
			});
			this.oValueHelpDialog.setFilterBar(oFilterBar);
			this.oValueHelpDialog.addStyleClass("sapUiSizeCozy");
			this.oValueHelpDialog.open();

		},

		applyUoMFilter: function(question) {

			var aFilters = [
				new sap.ui.model.Filter("Msehi", sap.ui.model.FilterOperator.Contains, question),
				new sap.ui.model.Filter("Msehl", sap.ui.model.FilterOperator.Contains, question)
			];

			var filter = new sap.ui.model.Filter({
				filters: aFilters,
				and: false
			});

			var oTable1 = this.oValueHelpDialog.getTable();

			oTable1.getBinding("rows").filter(filter);

		},

		onValueHelpRequestLifNr: function(oEvent) {

			var that = this;
			var sField = oEvent.getSource().getProperty('name');

			this.oValueHelpDialogLifNr = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({

				title: this.getResourceBundle().getText("vendorCode"),
				supportMultiselect: false,
				supportRanges: false,
				supportRangesOnly: false,
				key: "Lifnr",
				descriptionKey: "Name1",
				stretch: sap.ui.Device.system.phone,

				ok: function(oControlEvent) {
					that.aTokens = oControlEvent.getParameter("tokens");
					var valor = that.aTokens[0].getProperty("key");
					var text = that.aTokens[0].getProperty("text");
					//		that.getView().byId(sField + "_id").setValue(valor);
					that.peticion.getData().Lifnr = valor;
					that.peticion.getData().Name1 = text;
					that.getView().getModel("Peticion").refresh(true);
					that.oValueHelpDialogLifNr.close();
				},

				cancel: function(oControlEvent) {
					that.oValueHelpDialogLifNr.close();
				},

				afterClose: function() {
					that.oValueHelpDialogLifNr.destroy();
					that.oValueHelpDialogLifNr = null;
				}
			});

			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
					label: this.getResourceBundle().getText("vendorCode"),
					template: "Lifnr"
				}, {
					label: this.getResourceBundle().getText("vendor"),
					template: "Name1",
					demandPopin: true
				}]
			});
			this.oValueHelpDialogLifNr.getTable().setModel(oColModel, "columns");

			if (this.oValueHelpDialogLifNr.getTable().bindRows) {
				this.oValueHelpDialogLifNr.getTable().bindRows("/");
			}
			if (this.oValueHelpDialogLifNr.getTable().bindItems) {
				var oTable = this.oValueHelpDialogLifNr.getTable();

				oTable.bindAggregation("items", "/", function(sId, oContext) {
					var aCols = oTable.getModel("columns").getData().cols;

					return new sap.m.ColumnListItem({
						cells: aCols.map(function(column) {
							var colname = column.template;
							return new sap.m.Label({
								text: "{" + colname + "}"
							});
						})
					});
				});
			}

			var oFilterBarLifNr = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: false,
				filterBarExpanded: true,
				showFilterConfiguration: false,
				showGoOnFB: !sap.ui.Device.system.phone,
				filterItems: [
					new sap.ui.comp.filterbar.FilterItem({
						name: "Linfr",
						label: this.getResourceBundle().getText("vendorCode"),
						control: new sap.m.Input({
							type: "Number",
							maxLength : 10,
							submit: function() {
								that.oValueHelpDialogLifNr.getFilterBar().search();
							}
						})

					}),
					new sap.ui.comp.filterbar.FilterItem({
						name: "Name1",
						label: this.getResourceBundle().getText("vendor"),
						control: new sap.m.Input({
							submit: function() {
								that.oValueHelpDialogLifNr.getFilterBar().search();
							}
						})
					})
				],

				search: function(oEventSearch) {

					var aOdataFilters = oEventSearch.getParameter("selectionSet");
					var aFilters = [
						new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, aOdataFilters[0].getValue()),
						new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.EQ, aOdataFilters[1].getValue().toString().toUpperCase())
					];

					that.getOwnerComponent().getModel().read("/VendorSet", {
						filters: aFilters,
						async: false,
						success: function(oData, oResponse) {
							that.oLifnr.setData(oData.results);
							that.oValueHelpDialogLifNr.getTable().setModel(that.oLifnr);
							that.oValueHelpDialogLifNr.getTable().bindRows("/");
							that.oValueHelpDialogLifNr.update();
						}
					});

				}
			});
			this.oValueHelpDialogLifNr.setFilterBar(oFilterBarLifNr);
			this.oValueHelpDialogLifNr.addStyleClass("sapUiSizeCozy");
			this.oValueHelpDialogLifNr.open();

		},

		changeLifnr: function() {
			var that = this;
			var lifnr = this.peticion.getData().Lifnr;
			if (lifnr === '') {
				this.peticion.getData().Name1 = '';
			} else {
				this.getOwnerComponent().getModel().read("/VendorSet('" + lifnr +"')", {
				 ///VendorSet('" + lifnr + "')", {
					async: false,
					success: function(oData, oResponse) {
							that.peticion.getData().Lifnr = oData.Lifnr;
							that.peticion.getData().Name1 = oData.Name1;
							that.getView().getModel("Peticion").refresh(true);
					},
					error: function(oResponse) {
						that.peticion.getData().Lifnr = '';
						that.peticion.getData().Name1 = '';
						that.getView().getModel("Peticion").refresh(true);
					}
				});
			}

			this.getView().getModel("Peticion").refresh(true);
		},

		// applyUoMFilter: function(question) {

		// 	var aFilters = [
		// 		new sap.ui.model.Filter("Msehi", sap.ui.model.FilterOperator.Contains, question),
		// 		new sap.ui.model.Filter("Msehl", sap.ui.model.FilterOperator.Contains, question)
		// 	];

		// 	var filter = new sap.ui.model.Filter({
		// 		filters: aFilters,
		// 		and: false
		// 	});

		// 	var oTable1 = this.oValueHelpDialog.getTable();

		// 	oTable1.getBinding("rows").filter(filter);

		// },

		onAddRow: function(oEvent) {
			var oRow = {
				"Spras": "",
				"Maktx": ""
			};

			this.peticion.getData().goToText.push(oRow);
			this.getView().getModel("Peticion").refresh(true);
		},

		onDeleteRow: function(oEvent) {
			// Recuperamos el path del elemento que ha lanzado el evento
			var sPath = oEvent.getSource().getBindingContext("Peticion").getPath();

			// El path es de tipo /goToText/<num>, por eso usamos un 10 para seleccionar el número sólo
			var sIndex = sPath.substring(10);
			// Borramos el objeto del array, se usa un splice para mover los objetos posteriores y evitar huecos vacios
			this.peticion.getData().goToText.splice(sIndex, 1);
			this.getView().setModel(this.peticion, "Peticion");

			// Refrescamos el modelo
			this.getView().getModel("Peticion").refresh(true);

		},

		/* =========================================================== */
		/* Internal functions
		/* =========================================================== */
		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Details page
		 * @private
		 */
		_navBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getRouter().getTargets().display("object");
			}
		},

		_showDetail: function(sPeticion) {
			this.getRouter().navTo("object", {
				Zzpeticion: encodeURIComponent(sPeticion)
			}, false);
		},

		/**
		 * Opens a dialog letting the user either confirm or cancel the quit and discard of changes.
		 * @private
		 */
		_showConfirmQuitChanges: function() {
			var oComponent = this.getOwnerComponent(),
				oModel = this.getModel();
			var that = this;
			MessageBox.confirm(
				this._oResourceBundle.getText("confirmCancelMessage"), {
					styleClass: oComponent.getContentDensityClass(),
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that.getModel("appView").setProperty("/addEnabled", true);
							oModel.resetChanges();
							that._oODataModel.deleteCreatedEntry(that.oContextCreated);
							that._navBack();
						}
					}
				}
			);
		},

		/**
		 * Prepares the view for editing the selected object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */
		_onEdit: function(oEvent) {
			var oData = oEvent.getParameter("data"),
				oView = this.getView();
			this._oViewModel.setProperty("/mode", "edit");
			this._oViewModel.setProperty("/enableCreate", true);
			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("editViewTitle"));

			oView.bindElement({
				path: oData.objectPath
			});
		},

		/**
		 * Prepares the view for creating new object
		 * @param {sap.ui.base.Event} oEvent the  display event
		 * @private
		 */

		_onCreate: function(oEvent) {

			//	var that = this;

			if (oEvent.getParameter("name") && oEvent.getParameter("name") !== "create") {
				this._oViewModel.setProperty("/enableCreate", false);
				this.getRouter().getTargets().detachDisplay(null, this._onDisplay, this);
				this.getView().unbindObject();
				return;
			}

			this._oViewModel.setProperty("/viewTitle", this._oResourceBundle.getText("createViewTitle"));
			this._oViewModel.setProperty("/mode", "create");
			var oContext = this._oODataModel.createEntry("MaterialSet", {
				success: this._fnEntityCreated.bind(this),
				error: this._fnEntityCreationFailed.bind(this)
			});

			this.getView().setBindingContext(oContext);

			this.peticion = new sap.ui.model.json.JSONModel();

			this.sCreatePath = oContext.sPath;
			this.oContextCreated = oContext;

			this.peticion.setData(this._oODataModel.oData[oContext.sPath.substring(1)]);

			this.peticion.getData().ZzprodAcab = "";
			this.peticion.getData().ZzfabInt = "";
			this.peticion.getData().ZztipoMat = "";
			this.peticion.getData().ZzdgLegal = "";
			this.peticion.getData().Zzestructura = "";
			this.peticion.getData().ZzestanEspecDg = "";
			this.peticion.getData().ZzctrlCalidad = "";
			this.peticion.getData().Zzbiologico = "";
			this.peticion.getData().Zzdisenyo = "";

			var languages = [];

			var oUser = sap.ushell.Container.getUser();
			this.peticion.getData().Ernam = oUser.getId();

			this.peticion.getData().goToText = languages;

			this.getView().setModel(this.peticion, "Peticion");

			// Inicializamos los campos para que este escondidos
			this.onInitFields();
			this.getView().byId("petition_id").setValue("");

			// Recuperamos el parametro de labor
			this.bErrorLabor = false;
			this.getLabor();
		},

		/**
		 * Checks if the save button can be enabled
		 * @private
		 */
		_validateSaveEnablement: function() {

			var aInputControls0 = this._getFormFields(this.byId("__form0"));

			aInputControls0 = aInputControls0.concat(this._getFormFields(this.byId("__form1")));
			aInputControls0 = aInputControls0.concat(this._getFormFields(this.byId("__form2")));
			aInputControls0 = aInputControls0.concat(this._getFormFields(this.byId("__form3")));

			var oControl;
			for (var m = 0; m < aInputControls0.length; m++) {
				oControl = aInputControls0[m].control;
				if (aInputControls0[m].required) {

					var sValue = "";

					if (oControl.getMetadata().getName() === "sap.m.Select") {
						sValue = oControl.getSelectedKey();
					} else {
						sValue = oControl.getValue();
					}

					if (!sValue) {
						this._oViewModel.setProperty("/enableCreate", false);
						return;
					}
				}
			}

			// Si tenemos true, es que tenemos un error
			if (this.bErrorLabor) {
				this._oViewModel.setProperty("/enableCreate", false);
				return;
			}

			// Si estan todos los campos obligatorios rellenos, validamos la linea de negocio
			this._validateLineaNegocio();

			this._checkForErrorMessages();

		},

		_validateLineaNegocio: function() {
			var that = this;
			var oPeticion = this.peticion.getData();

			var sPath = "";

			if (oPeticion.ZzprodAcab === "Y") {
				sPath = oPeticion.ZzprodAcab + oPeticion.ZzfabInt + oPeticion.ZzdgLegal;
			} else {
				if (oPeticion.Zzestructura === "Y") {
					sPath = oPeticion.ZzprodAcab + oPeticion.Zzestructura + oPeticion.ZzfabInt + oPeticion.ZzestanEspecDg + oPeticion.ZzctrlCalidad +
						oPeticion.Zzbiologico;

				} else {
					sPath = oPeticion.ZzprodAcab + oPeticion.Zzestructura + oPeticion.ZztipoMat + oPeticion.ZzestanEspecDg + oPeticion.ZzctrlCalidad +
						oPeticion.Zzbiologico + oPeticion.Zzdisenyo;

				}
			}

			this.oModelLineaNegocio = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZOD_PP_0001_SRV/");

			this.oModelLineaNegocio.read("/DecisionPathSet(Zzrama='" + sPath + "',Zzlnegocio='" + this.peticion.getData().Zzlnegocio + "')", {
				async: false,
				success: function(oData, oResponse) {
					//Nothing to do
				},
				error: function(oResponse) {
					that._oViewModel.setProperty("/enableCreate", false);

					var sErrorMsg = that._oResourceBundle.getText("errorBusinessLine");

					var dialog = new Dialog({
						title: that._oResourceBundle.getText("errorTitle"),
						type: 'Message',
						state: 'Error',
						content: new sap.m.Text({
							text: sErrorMsg
						}),
						beginButton: new Button({
							text: that._oResourceBundle.getText("textOk"),
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});

					dialog.open();

				}
			});

		},

		/**
		 * Checks if there is any wrong inputs that can not be saved.
		 * @private
		 */

		_checkForErrorMessages: function() {
			var aMessages = this._oBinding.oModel.oData;
			if (aMessages.length > 0) {
				var bEnableCreate = true;
				for (var i = 0; i < aMessages.length; i++) {
					if (aMessages[i].type === "Error" && !aMessages[i].technical) {
						bEnableCreate = false;
						break;
					}
				}
				this._oViewModel.setProperty("/enableCreate", bEnableCreate);
			} else {
				this._oViewModel.setProperty("/enableCreate", true);
			}
		},

		/**
		 * Handles the success of updating an object
		 * @private
		 */
		_fnUpdateSuccess: function() {
			this.getModel("appView").setProperty("/busy", false);
			this.getView().unbindObject();
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the success of creating an object
		 *@param {object} oData the response of the save action
		 * @private
		 */
		_fnEntityCreated: function(oData) {
			var sObjectPath = this.getModel().createKey("MaterialSet", oData);
			this.getModel("appView").setProperty("/itemToSelect", "/" + sObjectPath); //save last created
			this.getModel("appView").setProperty("/busy", false);
			this.getRouter().getTargets().display("object");
		},

		/**
		 * Handles the failure of creating/updating an object
		 * @private
		 */
		_fnEntityCreationFailed: function() {
			this.getModel("appView").setProperty("/busy", false);
		},

		/**
		 * Handles the onDisplay event which is triggered when this view is displayed 
		 * @param {sap.ui.base.Event} oEvent the on display event
		 * @private
		 */
		_onDisplay: function(oEvent) {
			var oData = oEvent.getParameter("data");
			if (oData && oData.mode === "update") {
				this._onEdit(oEvent);
			} else {
				this._onCreate(oEvent);
			}
		},

		/**
		 * Gets the form fields
		 * @param {sap.ui.layout.form} oSimpleForm the form in the view.
		 * @private
		 */
		_getFormFields: function(oSimpleForm) {
			var aControls = [];
			var aFormContent = oSimpleForm.getContent();
			var sControlType;
			for (var i = 0; i < aFormContent.length; i++) {
				sControlType = aFormContent[i].getMetadata().getName();
				if (sControlType === "sap.m.Input" || sControlType === "sap.m.DateTimeInput" || sControlType === "sap.m.CheckBox" || sControlType ===
					"sap.m.ComboBox" || sControlType === "sap.m.Select") {
					aControls.push({
						control: aFormContent[i],
						required: aFormContent[i - 1].getRequired && aFormContent[i - 1].getRequired()
					});
				}
			}
			return aControls;
		}
	});

});