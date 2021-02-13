import { YAMLMap } from 'yaml/types'
import Identify from './Identify'

class NoodlMap extends YAMLMap {
	constructor(args) {
		super()
	}

	isIf() {
		return Identify.fold.if(this)
	}

	/* -------------------------------------------------------
		---- ACTIONS / EMIT / GOTO / TOAST
	-------------------------------------------------------- */

	isActionLike() {
		return Identify.action.any(this)
	}

	isBuiltInAction() {
		return Identify.action.builtIn(this)
	}

	isEvalObjectAction() {
		return Identify.action.builtIn(this)
	}

	isPageJumpAction() {
		return Identify.action.builtIn(this)
	}

	isPopUpAction() {
		return Identify.action.builtIn(this)
	}

	isPopUpDismissAction() {
		return Identify.action.builtIn(this)
	}

	isRefreshAction() {
		return Identify.action.builtIn(this)
	}

	isSaveObjectAction() {
		return Identify.action.builtIn(this)
	}

	isUpdateObjectAction() {
		return Identify.fold.emit(this)
	}

	isGoto() {
		return Identify.fold.goto(this)
	}

	isToast() {
		return Identify.fold.toast(this)
	}

	/* -------------------------------------------------------
		---- COMPONENTS
	-------------------------------------------------------- */

	isButtonComponent() {
		return Identify.component.button(this)
	}

	isDividerComponent() {
		return Identify.component.divider(this)
	}

	isFooterComponent() {
		return Identify.component.footer(this)
	}

	isHeaderComponent() {
		return Identify.component.header(this)
	}

	isImageComponent() {
		return Identify.component.image(this)
	}

	isLabelComponent() {
		return Identify.component.label(this)
	}

	isListComponent() {
		return Identify.component.list(this)
	}

	isListItemComponent() {
		return Identify.component.listItem(this)
	}

	isPluginComponent() {
		return Identify.component.plugin(this)
	}

	isPluginHeadComponent() {
		return Identify.component.pluginHead(this)
	}

	isPluginBodyTailComponent() {
		return Identify.component.pluginBodyTail(this)
	}

	isPopUpComponent() {
		return Identify.component.popUp(this)
	}

	isRegisterComponent() {
		return Identify.component.register(this)
	}

	isSelectComponent() {
		return Identify.component.select(this)
	}

	isScrollViewComponent() {
		return Identify.component.scrollView(this)
	}

	isTextFieldComponent() {
		return Identify.component.textField(this)
	}

	isTextViewComponent() {
		return Identify.component.textView(this)
	}

	isVideoComponent() {
		return Identify.component.video(this)
	}

	isViewComponent() {
		return Identify.component.view(this)
	}
}

export default NoodlMap
