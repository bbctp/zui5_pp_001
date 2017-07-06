sap.ui.define(["com/grifols/pp/wf/materials/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/Button", "sap/m/Dialog",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, Button, Dialog, MessageBox) {
	"use strict";

	return BaseController.extend("com.grifols.pp.wf.materials.controller.CreateEntity", {

		_oBinding: {},
/**/
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Importamos el objeto de value help
			jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");

			var that = this;
			this.getRouter().getTargets().getTarget("create").attachDisplay(null, this._onDisplay, this);
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
			this._oViewModel = new JSONModel({
				enableCreate: false,
				delay: 0,
				busy: false,
				mode: "create",
				viewTitle: ""
			});
			this.setModel(this._oViewModel, "viewModel");

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
			// Debido a la limitación que existe de 100 items, indicamos al modelo que puede contener 500 items.
			this.oUoM.setSizeLimit(500);
			this.getUoM();

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


			// Cargamos las monedas
			this.oCurr = new sap.ui.model.json.JSONModel();
			this.oCurr.setSizeLimit(500);
			this.getCurrencies();
			
			// Cargamos lasline of business
			this.oLineBusiness = new sap.ui.model.json.JSONModel();
			this.oLineBusiness.setSizeLimit(500);
			this.getLineBusiness();
			

			// Inicializamos los campos para que este escondidos
			this.onInitFields();
		},

		getLabor: function() {
			var that = this;

			this.getOwnerComponent().getModel().read("/ParameterSet('ZPP_LABOR')", {
				async: false,
				success: function(oData, oResponse) {

				},
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

		/**
		 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user. 
		 * @function
		 * @public
		 */
		onCopyPetition: function() {
			var that = this;

			var sPetition = this.getView().byId("petition_id").getValue();

			if (sPetition !== "") {

				this.getOwnerComponent().getModel().read("/MaterialSet('" + sPetition + "')", {
					async: false,
					success: function(oData, oResponse) {

						// Datos Básicos
						that.getView().byId("Maktx_id").setValue(oData.Maktx);
						that.getView().byId("Werks_id").setSelectedKey(oData.Werks);
						
						that.getView().byId("ZzsubsMat_box_id").setSelectedKey(oData.ZzsubsMat);
						that.getView().byId("ZzmatnrSubs_id").setValue(oData.ZzmatnrSubs);

						if (oData.ZzsubsMat === "Y") {
							that.getView().byId("ZzmatnrSubs_id").setVisible(true);
							that.getView().byId("ZzmatnrSubs_id_lbl").setVisible(true);
							that.getView().byId("ZzmatnrSubs_id_lbl").setRequired(true);
						} else {
							that.getView().byId("ZzmatnrSubs_id").setVisible(false);
							that.getView().byId("ZzmatnrSubs_id_lbl").setVisible(false);
							that.getView().byId("ZzmatnrSubs_id_lbl").setRequired(false);
						}

						that.getView().byId("Zzlnegocio_box_id").setSelectedKey(oData.Zzlnegocio);
						that.getView().byId("Zzdivision_box_id").setSelectedKey(oData.Zzdivision);
						that.getView().byId("Other_division_id").setValue(oData.ZzdivOthers);

						if (oData.Zzdivision === "OTHERS") {
							that.getView().byId("Other_division_id").setVisible(true);
							that.getView().byId("Other_division_id_lbl").setVisible(true);
							that.getView().byId("Other_division_id_lbl").setRequired(true);
						} else {
							that.getView().byId("Other_division_id").setVisible(false);
							that.getView().byId("Other_division_id_lbl").setVisible(false);
							that.getView().byId("Other_division_id_lbl").setRequired(false);
						}

						// Unidades de medida
						that.getView().byId("Meins_id").setSelectedKey(oData.Meins);
						that.getView().byId("Meinh_id").setSelectedKey(oData.Meinh);
						that.getView().byId("Umren_id").setValue(oData.Umren);

						// Arbol decision
						that.getView().byId("ZzprodAcab_box_id").setSelectedKey(oData.ZzprodAcab);
						that.setVisibleOrNo("ZzprodAcab_box_id", oData.ZzprodAcab);

						that.getView().byId("Zzestructura_box_id").setSelectedKey(oData.Zzestructura);
						that.setVisibleOrNo("Zzestructura_box_id", oData.Zzestructura);

						that.getView().byId("ZztipoMat_box_id").setSelectedKey(oData.ZztipoMat);
						that.setVisibleOrNo("ZztipoMat_box_id", oData.ZztipoMat);

						that.getView().byId("ZzfabInt_box_id").setSelectedKey(oData.ZzfabInt);
						that.setVisibleOrNo("ZzfabInt_box_id", oData.ZzfabInt);

						that.getView().byId("ZzdgLegal_box_id").setSelectedKey(oData.ZzdgLegal);
						that.setVisibleOrNo("ZzdgLegal_box_id", oData.ZzdgLegal);

						that.getView().byId("ZzestanEspecDg_box_id").setSelectedKey(oData.ZzestanEspecDg);
						that.setVisibleOrNo("ZzestanEspecDg_box_id", oData.ZzestanEspecDg);

						that.getView().byId("ZzctrlCalidad_box_id").setSelectedKey(oData.ZzctrlCalidad);
						that.setVisibleOrNo("ZzctrlCalidad_box_id", oData.ZzctrlCalidad);

						that.getView().byId("Zzbiologico_box_id").setSelectedKey(oData.Zzbiologico);
						that.setVisibleOrNo("Zzbiologico_box_id", oData.Zzbiologico);

						that.getView().byId("Zzdisenyo_box_id").setSelectedKey(oData.Zzdisenyo);
						that.setVisibleOrNo("Zzdisenyo_box_id", oData.Zzdisenyo);

						// Informacion adicional
						that.getView().byId("Zzconsumo_id").setValue(oData.Zzconsumo);
						that.getView().byId("Lifnr_id").setValue(oData.Lifnr);
						that.getView().byId("Name1_id").setValue(oData.Name1);
						that.getView().byId("Idnlf_id").setValue(oData.Idnlf);
						that.getView().byId("Netpr_id").setValue(oData.Netpr);
						that.getView().byId("Waersbox_id").setSelectedKey(oData.Waers);
						that.getView().byId("Eeind_id").setValue(oData.Eeind);
						that.getView().byId("ZzcompraGrupo_id").setValue(oData.ZzcompraGrupo);
						that.getView().byId("ZzempresaCompra_id").setValue(oData.ZzempresaCompra);
						that.getView().byId("Zzotros_id").setValue(oData.Zzotros);
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
							/*	"__metadata": {
									"type": "ZOD_PP_0001_SRV.MaterialText"
								}*/
							};

							that.peticion.getData().goToText.push(oRow);
						}

						that.getView().getModel("Peticion").refresh(true);
					}
				});

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
		
		onMessageErrorDialogPress: function () {
			var dialog = new Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: "The only error you can make is not even trying."
				}),
				beginButton: new Button({
					text: 'OK',
					press: function () {
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

					sap.m.MessageToast.show(that._oResourceBundle.getText("petitionHasBeenCreated"));

					that._oODataModel.deleteCreatedEntry(that.oContextCreated);

					that._showDetail(response.Zzpeticion);
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
				basicSearchText: "basicSearchText",
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
					template: "Msehl"
				}]
			});

			this.oValueHelpDialog.getTable().setModel(oColModel, "columns");

			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: false,
				filterBarExpanded: true,
				showGoOnFB: !sap.ui.Device.system.phone,
				filterItems: [
					new sap.ui.comp.filterbar.FilterItem({
						name: "Msehi",
						label: this.getResourceBundle().getText("uom"),
						control: new sap.m.Input()
					}),
					new sap.ui.comp.filterbar.FilterItem({
						name: "Msehl",
						label: this.getResourceBundle().getText("description"),
						control: new sap.m.Input()
					})
				],

				search: function(oEventSearch) {

					var aFilters = oEventSearch.getParameter("selectionSet");

					var aOdataFilters = [
						new sap.ui.model.Filter("Msehi", sap.ui.model.FilterOperator.EQ, aFilters[0].getValue()),
						new sap.ui.model.Filter("Msehl", sap.ui.model.FilterOperator.EQ, aFilters[1].getValue())
					];

					that.getOwnerComponent().getModel().read("/UoMSet", {
						filters: aOdataFilters,
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
		onAddRow: function(oEvent) {
			var oRow = {
				"Spras": "",
				"Maktx": ""
				/*"__metadata": {
					"type": "ZOD_PP_0001_SRV.MaterialText"
				}*/
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

			var that = this;

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