import Utils from "./module/Utils";
import TooltipFactory from "./module/TooltipFactory";
import {CONSTANTS} from "./module/enums/Constants";
import Settings from "./module/settings/Settings";

Hooks.once('init', async () => {
    const settings = Settings.getInstance();
    settings.registerSettings();
    Utils.debug('Settings registered.');

    await loadTemplates(Object.values(CONSTANTS.TEMPLATES));
    Utils.debug('Templates loaded.');
});
Hooks.once('canvasInit', () => {
    $(window).on('blur', TooltipFactory.removeTooltips.bind(TooltipFactory));
    $(window).on('keyup', (ev) => {
        if (ev.key === 'Alt') TooltipFactory.removeTooltips();
    });
});
Hooks.on('hoverToken', TooltipFactory.hoverToken.bind(TooltipFactory));
Hooks.on('preUpdateToken', TooltipFactory.removeTooltips.bind(TooltipFactory));
Hooks.on('canvasPan', TooltipFactory.removeTooltips.bind(TooltipFactory));
Hooks.on('renderTokenHUD', () => {
    // TODO: Follow the TokenHUD branch for a better fix... maybe!?
    const hasHealthEstimate = game?.modules?.get('healthEstimate')?.active;
    if (hasHealthEstimate) return;
    TooltipFactory.removeTooltips();
});
Hooks.on('deleteToken', TooltipFactory.removeTooltips.bind(TooltipFactory));
Hooks.on('renderTokenConfig', (tokenConfig: TokenConfig, $tokenConfig: JQuery, options: any): void => {
    const $resources = $tokenConfig.find('.tab[data-tab="resources"]');
    const noTooltip = tokenConfig.object.getFlag(Utils.moduleName, 'noTooltip');

    const $noTooltipCheckbox = $(`
        <div class="form-group">
            <label>No tooltip</label>
            <input type="checkbox" name="${Utils.moduleName}-no-tooltip" data-dtype="Boolean" ${noTooltip && 'checked'}>
        </div>`);

    $resources.append($noTooltipCheckbox);

    $noTooltipCheckbox.on('change', (ev) => {
        // @ts-ignore
        const isChecked = ev?.target?.checked || false;
        tokenConfig.object.setFlag(Utils.moduleName, 'noTooltip', isChecked);
    });
});