import { VocabularyItem } from '../types';
import { ADDITIONAL_CSV_DATA } from './additionalData';
import { CSV_DATA_PART_2 } from './vocabularyPart2';

// Fisher-Yates Shuffle Algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const parseRawData = (csvString: string): VocabularyItem[] => {
  if (!csvString) return [];
  const lines = csvString.trim().split('\n');
  const items: VocabularyItem[] = [];

  // Skip header if present
  // Note: we check line by line because we are merging multiple CSV strings, some might have headers in the middle.
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Skip known header lines
    if (line.startsWith('单词') || line.startsWith('word')) continue;

    // Split by comma
    const parts = line.split(',');
    if (parts.length < 2) continue;

    const word = parts[0]?.trim();
    if (!word) continue;

    const partOfSpeech = parts[1]?.trim();
    const cnDefinition = parts[2]?.trim();
    const enDefinition = parts[3]?.trim();
    const example = parts[4]?.trim();
    
    const synonyms = parts[5]?.trim() === 'N/A' ? '' : parts[5]?.trim();
    const antonyms = parts[6]?.trim() === 'N/A' ? '' : parts[6]?.trim();
    
    const rawMnemonic = parts[7]?.trim();
    let hook = rawMnemonic && rawMnemonic !== 'N/A' ? rawMnemonic.replace(/。+$/, '') : "暂无助记";

    // Create a robust unique ID
    items.push({
      id: `vocab-${word.toLowerCase()}-${Math.random().toString(36).slice(2, 7)}`,
      word,
      definition: cnDefinition || '暂无释义',
      enDefinition: enDefinition !== 'N/A' ? enDefinition : undefined,
      partOfSpeech: partOfSpeech !== 'N/A' ? partOfSpeech : undefined,
      example: example !== 'N/A' ? example : undefined,
      synonyms: synonyms,
      antonyms: antonyms,
      connectionHook: hook,
      createdAt: new Date().toISOString(),
      familiarityLevel: 0,
      nextReview: null,
      interval: 0,
      easeFactor: 2.5
    });
  }
  return items;
};

// --- DATA SECTION ---

const DATA_PART_1 = `单词,词性,中文释义,英文释义,例句,近义词,反义词,助记,,
abandon,v./n.,放纵; 放弃,carefree freedom from constraint; withdraw from,abandon oneself to emotion (感情用事),unconstraint,salvage,ab(离开)+ban(控制)→不受控制→放纵；抛弃。,,
abase,v.,降低(地位/职位/尊严),to lower in rank office prestige or esteem,unwilling to abase himself (不愿自贬身价),degrade,elevate,a+base(低/基础)→使地位变低→贬低。,,
abash,vt.,使尴尬; 使羞愧,to destroy self-possession; embarrass,feel abashed in public (当众感到羞愧),discomfit,embolden,和bashful(害羞的)同根，使人感到脸红尴尬。,,
abate,v.,减轻; 减少,reduce in degree or intensity; reduce in amount,abate his rage (平息愤怒),moderate,intensify,a+bate(打/扣减)→把气势打下去→减轻。,,
abbreviate,v.,缩写; 缩短,to make briefer,abbreviate building as bldg,abridge,extend,ab+brev(短)+iate→使变短。,,
abdicate,v.,正式放弃(权力/责任),to renounce a throne or relinquish formally,abdicate the throne (退位),relinquish,assume,ab(离开)+dic(说)→宣布离开→正式辞职/退位。,,
aberrant,adj.,异常的; 非常规的,deviating from the usual or natural type,aberrant behavior (异常行为),anomalous,normal,ab(偏离)+err(跑/犯错)→跑偏了→异常的。,,
abet,v.,鼓励/教唆,to actively encourage,abet someone's opinion (支持观点),assist,stymie,a+bet(诱饵/打赌)→用诱饵诱导→教唆。,,
abeyance,n.,中止; 搁置,temporary inactivity,hold the plan in abeyance (使计划暂停),quiescence,continuance,a+bey(张嘴/渴望)→张着嘴等待某事发生→中止状态。,,
abhor,vt.,深恶痛绝; 极度厌恶,to regard with extreme repugnance,abhor violence (厌恶暴力),abominate,admire,ab(离开)+hor(颤抖/恐怖)→因恐惧而躲开→深恶痛绝。,,
abiding,adj.,持久的,lasting for a long time; enduring,an abiding love (持久的热爱),perpetual,evanescent,abide(遵守/居住)→能经得住时间考证的→持久的。,,
abject,adj.,悲惨的; 卑微的,sunk in low state; humble spirit,abject poverty (绝望的贫穷),servile,noble,ab(向下)+ject(扔)→被扔到最底层→卑微的。,,
abjure,v.,发誓放弃; 抵制,reject/abandon under oath; resist temptation,abjure one's belief (放弃信仰),renounce,embrace,ab(离开)+jure(发誓)→发誓离开→正式放弃。,,
abnegate,v.,否认/放弃,deny; renounce,abnegate the idea (放弃观念),repudiate,reaffirm,ab(离开)+neg(否认)→完全否认→放弃权益。,,
abominate,v.,痛恨; 厌恶,to hate or loathe intensely,abominate slavery (痛恨奴隶制),detest,adore,ab(离开)+omen(预兆)→躲避不祥的预兆→痛恨。,,
aboveboard,adj.,光明正大的,free from deceit or duplicity,aboveboard transactions (正大光明的交易),honest,surreptitious,在桌面上伸手→没有搞桌下交易→光明正大。,,
abrade,v.,磨损; 精神磨损,to wear away by friction; wear down spirit,The gossips abrade her (流言磨损她),chafe,augment,ab(离开)+rade(刮)→刮掉表面→磨损。,,
abridge,v.,缩短; 缩小,to shorten in duration or extent,abridge distance (缩短距离),curtail,amplify,a+bridge(桥)→通过搭桥缩短两地距离。,,
abrogate,v.,正式废除; 无视,to abolish by authority; treat as nonexistent,abrogate the law (废除法律),nullify,uphold,ab(离开)+rog(要求)→取消要求→废除。,,
abscond,v.,偷偷离开,to depart secretly and hide,abscond from prison (越狱),flee,remain,abs(离开)+cond(藏)→藏起来跑掉。,,
absolute,adj.,专制的; 无限的; 纯净的,unconstrained; total; pure,absolute ruler (独裁者),autocratic,qualified,ab(离开)+solute(松开/限制)→离开限制→绝对的/专制的。,,
absolve,v.,使无罪; 解除责任,set free from obligation or guilt,absolve from blame (免受责备),exonerate,incriminate,ab(离开)+solve(解开)→解开罪恶的束缚。,,
abstain,v.,自我克制; 戒绝,to refrain from by choice,abstain from smoking (戒烟),forgo,indulge,abs(离开)+tain(拿)→手拿开不碰→戒绝。,,
abstemious,adj.,有节制的; 节俭的,restraint in food or alcohol; sparing,abstemious diet (节制的饮食),temperate,indulgent,abs(离开)+tem(烈酒)→远酒→有节制的。,,
abstract,v./adj.,总结; 提取; 分心,summarize; draw away attention; non-concrete,abstract an essay (总结文章),digest,elaborate,abs(离开)+tract(拉)→拉出核心部分→总结/摘要。,,
abstruse,adj.,难以理解的,difficult to comprehend; recondite,abstruse calculations (深奥计算),arcane,accessible,abs(离开)+truse(推)→被推向远方不见处→深奥难懂。,,
absurd,adj.,不合理的/荒谬的,ridiculously unreasonable,an absurd argument (无稽之谈),ludicrous,rational,ab(加强)+surd(聋/无声)→听不进理智的声音→荒谬。,,
abundant,adj.,大量的,marked by great plenty,an abundant land (富饶的土地),ample,scanty,ab(加强)+und(波动/水)→水多到漫溢波动。,,
abuse,v.,辱骂; 滥用,to condemn unjustly; misuse,abuse a privilege (滥用特权),misuse,esteem,ab(错)+use(用)→用错了→滥用/辱骂。,,
acquainted,adj.,熟悉的,having information result of study,well acquainted with,conversant,ignorant,ac(去)+cogn(知道)→去知道→熟悉的。,,
abysmal,adj.,极端的; 深不可测的,immeasurably great; bottomless,abysmal ignorance (极度无知),profound,superficial,a(无)+bysm(底部)→没底的。,,
accede,v.,赞成; 继承,to express approval; to enter upon an office,accede to demand (顺应民意),acquiesce,demur,ac(向)+cede(走)→走向对方→同意。,,
ad hoc,adj.,专门的,concerned with a particular end,ad hoc committee (专门委员会),specific,general,拉丁语：to this→针对此事。,,
accessible,adj.,易到达的; 易懂的,easy reach; capable of understood,accessible town (可到达的城镇),reachable,abstruse,ac(向)+cess(走)→能走过去的。,,
accessory,adj./n.,辅助的; 配件,supplementary function; accompaniment,accessory features (附加功能),peripheral,main,ac(向)+cess(走)→在主件旁边走的副手。,,
accidental,adj.,意外的/偶然的,occurring unexpectedly or by chance,accidental death (意外死亡),fortuitous,deliberate,ac(发生)+cid(掉落)→天上掉下来的事→偶然。,,
acclimate,v.,使适应,to change to suit new situation,acclimate to office (适应工作),adjust,unfamiliar,ac(去)+climate(气候)→适应新气候。,,
accolade,n./v.,同意/赞赏; 赞扬,expression of approval; to praise,win accolades (赢得赞赏),applause,reprobate,ac(向)+col(脖子)→搂脖子拥抱授勋→奖励。,,
accommodate,v.,改变以适应; 使和谐,adjust to suit; bring to harmony,accommodate to life (适应生活),attune,disharmonize,ac(向)+commode(方便)→使之方便→适应。,,
accentuate,v.,强调,to make more noticeable,accentuate importance (强调重要性),emphasize,downplay,ac(向)+cent(唱/调子)→把音调高→强调。,,
accrete,v.,逐渐增长,to grow or increase gradually,accrete the public interest (增加公众利益),accumulate,wear away,ac(去)+crete(增长)→去增长。,,
accumulate,vi.,逐渐增长,to increase gradually in quantity,accumulate a fortune (积累财富),mount,dissipate,ac(加强)+cumul(堆积)→堆起来→积累。,,
acerbic,adj.,(语调)尖酸的,intended to cause hurt feelings,acerbic commentary (尖酸评论),pungent,sweet,acer(尖/酸)+bic→说话尖酸。,,
acme,n.,顶点/极点,the highest point or stage,the acme of his career (事业巅峰),culmination,bottom,音联想：爱看美→在山顶爱看美景。,,
acquiesce,v.,勉强同意/默许,to accept/comply passively,acquiesce to fleecing (默许敲竹杠),assent,resist,ac(去)+quiet(安静)→安静地接受→默许。,,
acrid,adj.,刻薄的,intended to cause hurt feelings,acrid temper (刻薄性情),pungent,gentle,acr(酸/尖)+id→性情尖酸。,,
acrimonious,adj.,充满仇恨的/刻薄的,having deep-seated resentment,acrimonious debate (激烈辩论),rancorous,amiable,acri(尖酸)+moni(名词缀)→充满敌意的。,,
acumen,n.,洞察力/鉴别力,exceptional discernment and judgment,business acumen (商业洞察力),shrewdness,unable to discern,acu(尖)+men→头脑尖锐→敏锐。,,
acute,adj.,敏锐的; 极强的,marked by keen discernment; extreme,an acute thinker (敏锐的思想家),keen,soft,acu(尖)+te→尖锐的。,,
adamant,adj.,固执的/不可动摇的,unshakable/insistent,adamant about staying (执意留下),obdurate,vacillatory,a(不)+dama(驯服)→不可驯服的→固执的。,,
adapt,v.,修改/使适应,to modify according with change,adapt to the change (适应变化),adjust,unfit,ad(去)+apt(能力/适合)→去变得适合。,,
addict,v./n.,沉溺/上瘾; 有瘾的人,devote oneself habitually,be addicted to drug (吸毒成瘾),fanatic,nonfan,ad(加强)+dict(说)→反复说想要→上瘾。,,
adhere,v.,服从/遵守,to act according to commands,adhere to the rules (遵守规则),comply,defy,ad(加强)+here(粘)→粘在规则上→遵守。,,
adjourn,vi.,延期/休会,to suspend a session,meeting adjourned for a week,suspend,convoke,ad(去)+journ(日期)→改变日期→延期。,,
adjunct,n.,附属物/非必须部分,something added but not essential,important adjunct (重要辅助),appendage,essential,ad(去)+junct(连接)→连接上的东西。,,
ad-lib,adj.,即兴的,done without previous thought,ad-lib comedy (即兴喜剧),impromptu,planned,ad libitum(拉丁语：随心所欲)。,,
admonish,v.,建议; 责备,to give advice; to reprove,admonish her for littering (责备乱丢),counsel,praise,ad(加强)+mon(提醒)→反复提醒→告诫。,,
adore,vt.,喜爱; 宠爱,to take pleasure in; feel devotion,adore his wife (宠爱妻子),cherish,abhor,ad(加强)+ore(口)→口中赞美→崇拜。,,
adulate,v.,极度谄媚/拍马屁,to praise too much,adulate his boss (拍老板马屁),overpraise,scorn,ad(去)+ulate(尾巴/舔)→摇尾乞怜→谄媚。,,
adulterate,vt.,掺杂/加入低等成分,to corrupt by inferior substance,adulterate with additives (掺假),pollute,enrich,ad+ulter(外面的/异类)→加入外物→掺杂。,,
adumbrate,vt.,预示,to give a slight indication beforehand,adumbrate the civil war (预示内战),harbinger,reveal,ad(加强)+umbr(阴影)→在阴影中显现→预示。,,
adventitious,adj.,外来的/后天的,coming from another source,adventitious viruses (外来病毒),external,innate,ad(向)+vent(来)→后来到手上的。,,
adversary,n.,敌手/对手,one that contends with; enemy,political adversary (政敌),antagonist,ally,ad(相反)+vers(转)→转到对立面→对手。,,
advert,vi.,引起注意/提到,to call attention; refer,advert to the problem (提到问题),refer,ignore,ad(去)+vert(转)→转过来看→注意到。,,
advocate,vt.,支持/提倡,to speak in favor of; support,advocate traditional methods (支持传统),back,impugn,ad(加强)+voc(声音)→大声疾呼→拥护。,,
affable,adj.,和蔼的/温和的,characterized by ease and friendliness,an affable manner (随和举止),genial,irascible,af(加强)+fa(说)→容易说话的→和蔼。,,
affinity,n.,喜欢/倾向; 相似,habitual attraction; commonality,affinity for living things (喜欢活物),penchant,aversion,af(加强)+fin(范围/边界)→边界靠近→亲近/相似。,,
affluent,adj.,富裕的,having sufficient supply of material,affluent society (富裕社会),opulent,indigent,af(加强)+flu(流)→钱多到往外流→富裕。,,
aggrandize,vt.,增加/提高(力量/财富),to enhance the reputation,exploit to aggrandize himself,augment,abase,ad+grand(大)→使其变大。,,
aggravate,vt.,加重/恶化,to make worse or more severe,aggravate the situation (恶化局势),complicate,alleviate,ad+grav(重)→使其变重。,,
aggregate,n./v.,集合体; 集合/聚集,a mass of units; gather into whole,aggregate of many states (集合体),sum,disperse,ag(加强)+greg(群)→成群结队→集合。,,
aggressive,adj.,好斗的; 强有力的,ready to attack; forceful,aggressive behavior (攻击性行为),combative,pacific,ag(去)+gress(走)→往前冲→侵略性。,,
aggrieve,vt.,使苦恼/使悲痛,to give pain or trouble to,aggrieved ticket-holders (怨念的购票者),distress,gratify,ag(加强)+griev(重/悲伤)→使心情沉重。,,
agitate,v.,煽动; 使不安,arouse public feeling; disturb,agitate for better conditions (煽动),perturb,calm,ag(做)+it+ate→反复做某事→搅动/煽动。,,
agog,adj.,极度感兴趣的,showing urgent desire,agog over new toys (极度兴奋),avid,apathetic,a(在)+gog(同giggle/笑)→高兴地张着嘴。,,
agonize,v.,(使)非常痛苦,to feel deep sadness,agonize over every decision (痛苦抉择),suffer,comfort,agon(斗争/痛苦)+ize→像在角斗一样痛苦。,,
airtight,adj.,无瑕疵的,having no noticeable weakness,an airtight argument (滴水不漏),flawless,leaky,air(空气)+tight(紧)→空气都进不去→滴水不漏。,,
alacrity,n.,反应迅速/乐意,promptness; cheerful readiness,accept with alacrity (欣然接受),willingness,reluctance,alac(迅速)+rity→迅速而乐意。,,
alibi,n.,不在场证明/借口,an excuse to avert blame,alibi for homework (借口),defense,guilt,ali(其他)+bi(处)→在其他地方→不在场证明。,,
alienate,v.,疏远/离间,to make unfriendly/indifferent,alienate his colleagues (疏远同事),sour,unite,alien(异类)+ate→把人当异类→疏远。,,
align,vt.,调准/校准,to adjust to produce orientation,align the wheels (校正轮子),adjust,irregular,a+lign(线)→排成一条线。,,
allay,vt.,减轻,to reduce in intensity,allay one's fears (减轻恐惧),alleviate,aggravate,al(加强)+lay(放)→放下心来→减轻。,,
allegiance,n.,忠诚,devotion or loyalty to cause,allegiance to the USA (效忠),fidelity,treachery,al(去)+leg(法律/约束)→法律约束下的忠诚。,,
alleviate,v.,缓和/减轻,relieve; lessen,alleviate pain (减轻痛苦),assuage,exacerbate,al(加强)+levi(轻)→使变轻。
`;

// Merge all data parts
const rawData = [DATA_PART_1, ADDITIONAL_CSV_DATA, CSV_DATA_PART_2].join('\n');
const parsed = parseRawData(rawData);

export const INITIAL_DATA = shuffleArray(parsed);
