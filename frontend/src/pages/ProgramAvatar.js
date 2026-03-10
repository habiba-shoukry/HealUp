import React, { useState } from 'react';
import '../styles/ProgramAvatar.css';

// ─── Image map ────────────────────────────────────────────────────────────────
const AVATAR_IMAGES = {
  base: {
    s1: '/Avatars/sittingavatar.jpg',
    s2: '/Avatars/skin-brown.png',
  },
  skinArmour: {
    s2_ar2: '/Avatars/skin-brown-iron.png',
    s2_ar3: '/Avatars/skin-brown-mage.png',
    s2_ar4: '/Avatars/skin-brown-gold.png',
    s2_ar5: '/Avatars/skin-brown-shadow.png',
    s2_ar6: '/Avatars/skin-brown-dragon.png',
  },
  armour: {
    ar1:  null,
    ar2:  '/Avatars/armour-iron.png',
    ar3:  '/Avatars/armour-mage.png',
    ar4:  '/Avatars/armour-gold.png',
    ar5:  '/Avatars/armour-shadow.png',
    ar6:  '/Avatars/armour-dragon.png',
    ar7:  null,
    ar8:  null,
    ar9:  null,
    ar10: null,
  },
  hair: {
    hs1_brown:  null,
    hs2_brown:  '/Avatars/hair-spiky.png',
    hs3_brown:  '/Avatars/hair-long.png',
    hs4_brown:  '/Avatars/hair-wavy.png',
    hs1_black:  null,
    hs2_black:  '/Avatars/hair-spiky-black.png',
    hs3_black:  '/Avatars/hair-long-black.png',
    hs4_black:  '/Avatars/hair-wavy-black.png',
    hs1_blonde: null,
    hs2_blonde: '/Avatars/hair-spiky-blonde.png',
    hs3_blonde: '/Avatars/hair-long-blonde.png',
    hs4_blonde: '/Avatars/hair-wavy-blonde.png',
  },
  pets: {
    p1: '/Avatars/pet-fire-dragon.png',
    p2: '/Avatars/pet-ice-dragon.png',
    p3: null,
    p4: '/Avatars/pet-golden-wyvern.png',
    p5: null,
    p6: null,
  },
  ears: {
    ae1: null,
    ae2: '/Avatars/ears-cat.png',
    ae3: '/Avatars/ears-bunny.png',
    ae4: '/Avatars/ears-fox.png',
    ae5: null,
    ae6: null,
    ae7: null,
    ae8: null,
  },
};

// ─── Sitting Avatar (layered) ─────────────────────────────────────────────────
const SittingAvatar = ({ selections }) => {
  const skin   = selections.skin      || 's1';
  const armour = selections.armour    || 'ar1';
  const style  = selections.hairStyle || 'hs1';
  const color  = selections.hairColor || 'hc1';

  const colorMap  = { hc1:'black', hc2:'brown', hc3:'blonde' };
  const colorName = colorMap[color] || 'brown';

  const skinArmourImg = AVATAR_IMAGES.skinArmour[`${skin}_${armour}`] || null;
  const baseImg       = AVATAR_IMAGES.base[skin] || '/Avatars/sittingavatar.jpg';
  const armourImg     = skin === 's1' ? (AVATAR_IMAGES.armour[armour] || null) : null;
  const hairImg       = AVATAR_IMAGES.hair[`${style}_${colorName}`] || null;
  const earsImg       = AVATAR_IMAGES.ears[selections.animalEars] || null;

  return (
    <div className="avatar-img-wrapper">
      <img
        src={skinArmourImg || baseImg}
        alt="avatar"
        className="avatar-base-img"
        onError={(e) => { e.target.src = '/Avatars/sittingavatar.jpg'; }}
      />
      {armourImg && (
        <img src={armourImg} alt="armour" className="avatar-layer-img"
          onError={(e) => { e.target.style.display = 'none'; }} />
      )}
      {hairImg && (
        <img src={hairImg} alt="hair" className="avatar-layer-img"
          onError={(e) => { e.target.style.display = 'none'; }} />
      )}
      {earsImg && (
        <img src={earsImg} alt="ears" className="avatar-layer-img"
          onError={(e) => { e.target.style.display = 'none'; }} />
      )}
    </div>
  );
};

// ─── Pixel Pet ────────────────────────────────────────────────────────────────
const PixelPet = ({ pet }) => {
  if (!pet) return null;
  const petImg = AVATAR_IMAGES.pets[pet.id];
  if (petImg) {
    return (
      <img src={petImg} alt={pet.label}
        style={{ width:200, height:200, objectFit:'contain', imageRendering:'pixelated', display:'block' }}
        onError={(e) => { e.target.style.display='none'; }} />
    );
  }
  const c = pet.color;
  const dk = '#1a1008';
  const S2 = 3;
  const Px2 = ({ x, y, col }) => (
    <rect x={x*S2} y={y*S2} width={S2} height={S2} fill={col} />
  );
  const lighter = c + 'cc';
  return (
    <svg viewBox={`0 0 ${10*S2} ${12*S2}`} width={10*S2*2.2} height={12*S2*2.2}
      style={{ imageRendering:'pixelated', display:'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx={5*S2} cy={11.6*S2} rx={3.5*S2} ry={S2*0.5} fill="#00000033" />
      <Px2 x={1} y={0} col={c} /><Px2 x={2} y={0} col={c} />
      <Px2 x={7} y={0} col={c} /><Px2 x={8} y={0} col={c} />
      <Px2 x={1} y={1} col={c} /><Px2 x={8} y={1} col={c} />
      {[2,3,4,5,6,7].map(x=><Px2 key={`ph${x}`} x={x} y={1} col={dk}/>)}
      {[1,8].map(x=>[2,3,4].map(y=><Px2 key={`phs${x}${y}`} x={x} y={y} col={dk}/>))}
      {[2,3,4,5,6,7].map(x=><Px2 key={`ph2${x}`} x={x} y={5} col={dk}/>)}
      {[2,3,4,5,6,7].map(x=>[2,3,4].map(y=><Px2 key={`pf${x}${y}`} x={x} y={y} col={c}/>))}
      <Px2 x={3} y={3} col="#ffffff"/><Px2 x={6} y={3} col="#ffffff"/>
      <rect x={3*S2} y={3*S2} width={2} height={2} fill="#ffffffcc"/>
      <rect x={6*S2} y={3*S2} width={2} height={2} fill="#ffffffcc"/>
      <Px2 x={4} y={4} col={lighter}/><Px2 x={5} y={4} col={lighter}/>
      {[2,3,4,5,6,7].map(x=><Px2 key={`pbo${x}`} x={x} y={6} col={dk}/>)}
      {[1,8].map(x=>[6,7,8,9].map(y=><Px2 key={`pbos${x}${y}`} x={x} y={y} col={dk}/>))}
      {[2,3,4,5,6,7].map(x=><Px2 key={`pbo2${x}`} x={x} y={10} col={dk}/>)}
      {[2,3,4,5,6,7].map(x=>[7,8,9].map(y=><Px2 key={`pbf${x}${y}`} x={x} y={y} col={lighter}/>))}
      <Px2 x={8} y={9} col={c}/><Px2 x={9} y={8} col={c}/><Px2 x={9} y={7} col={c}/>
    </svg>
  );
};

// ─── Small preview icon ───────────────────────────────────────────────────────
const PreviewIcon = ({ item, category, hairCol }) => {
  if (category === 'skin' || category === 'hairColor') {
    return (
      <div style={{
        width:36, height:36, borderRadius:'50%', background: item.color,
        boxShadow:'inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
        border:'2px solid rgba(0,0,0,0.1)'
      }} />
    );
  }
  if (category === 'pets') {
    const petImg = AVATAR_IMAGES.pets[item.id];
    if (petImg) return <img src={petImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    return <span style={{ fontSize:'1.7rem' }}>{item.emoji}</span>;
  }
  if (category === 'hairStyle') {
    const hairImg = AVATAR_IMAGES.hair[item.id];
    if (hairImg) return <img src={hairImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    return <img src="/Avatars/sittingavatar.jpg" alt="default" style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} />;
  }
  if (category === 'animalEars') {
    const earsImg = AVATAR_IMAGES.ears[item.id];
    if (earsImg) return <img src={earsImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    if (item.id === 'ae1') return <span style={{ fontSize:'1.4rem' }}>🚫</span>;
    return <svg viewBox="3 -3 20 6" width="48" height="20" style={{ imageRendering:'pixelated' }}>{item.pixels?.map((px,i)=><rect key={i} x={px[0]} y={px[1]} width={1} height={1} fill={px[2]==='hc'?hairCol:px[2]} />)}</svg>;
  }
  if (category === 'armour') {
    const imgSrc = AVATAR_IMAGES.armour[item.id];
    if (imgSrc) return <img src={imgSrc} alt={item.label} style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    return <svg viewBox="6 12 14 8" width="42" height="24" style={{ imageRendering:'pixelated' }}>{item.pixels?.map((px,i)=><rect key={i} x={px[0]} y={px[1]} width={1} height={1} fill={px[2]} />)}</svg>;
  }
  return <div style={{ width:36, height:36, borderRadius:'50%', background: item.color||'#ccc' }} />;
};

// ─── Shop Data ────────────────────────────────────────────────────────────────
const SHOP = {
  skin: [
    { id:'s1', label:'Peach',       color:'#F4C2A1', owned:true  },
    { id:'s2', label:'Brown',       color:'#8B5E3C', owned:true  },
    { id:'s3', label:'Ivory',       color:'#F5DEB3', owned:false },
    { id:'s4', label:'Tan',         color:'#D2955A', owned:false },
    { id:'s5', label:'Deep',        color:'#4A2C17', owned:false },
    { id:'s6', label:'Mystic Blue', color:'#7EC8E3', owned:false },
    { id:'s7', label:'Forest',      color:'#6B8F4E', owned:false },
    { id:'s8', label:'Rose',        color:'#E8A0BF', owned:false },
    { id:'s9', label:'Void',        color:'#9B6B9B', owned:false },
  ],
  hairStyle: [
    { id:'hs1', label:'Default',    owned:true,  defaultColor:'#8B4513', back:[], front:[] },
    { id:'hs2', label:'Spiky',      owned:true,  defaultColor:'#8B4513', back:[], front:[] },
    { id:'hs3', label:'Long',       owned:true,  defaultColor:'#2C1810', back:[], front:[] },
    { id:'hs4', label:'Wavy',       owned:true,  defaultColor:'#DAA520', back:[], front:[] },
    { id:'hs5', label:'Twin Tails', owned:false, defaultColor:'#C0392B', back:[], front:[] },
    { id:'hs6', label:'Ahoge',      owned:false, defaultColor:'#8E44AD', back:[], front:[] },
    { id:'hs7', label:'Wild Mane',  owned:false, defaultColor:'#1C1C1C', back:[], front:[] },
  ],
  hairColor: [
    { id:'hc1',  label:'Black',  color:'#1C1C1C', owned:true  },
    { id:'hc2',  label:'Brown',  color:'#8B4513', owned:true  },
    { id:'hc3',  label:'Blonde', color:'#FFD700', owned:true  },
    { id:'hc4',  label:'Auburn', color:'#A0522D', owned:false },
    { id:'hc5',  label:'Red',    color:'#C0392B', owned:false },
    { id:'hc6',  label:'Purple', color:'#8E44AD', owned:false },
    { id:'hc7',  label:'Blue',   color:'#2980B9', owned:false },
    { id:'hc8',  label:'Pink',   color:'#FF69B4', owned:false },
    { id:'hc9',  label:'White',  color:'#E0E0E0', owned:false },
    { id:'hc10', label:'Green',  color:'#27AE60', owned:false },
  ],
  animalEars: [
    { id:'ae1', label:'No Ears',     color:'#cccccc', owned:true,  pixels:[] },
    { id:'ae2', label:'Cat Ears',    color:'#8B6914', owned:true,  pixels:[[8,-1,'#8B6914'],[8,-2,'#8B6914'],[9,-2,'#c8a96e'],[17,-1,'#8B6914'],[17,-2,'#8B6914'],[16,-2,'#c8a96e']] },
    { id:'ae3', label:'Bunny',       color:'#E0E0E0', owned:true,  pixels:[[9,-1,'#E0E0E0'],[9,-2,'#E0E0E0'],[9,-3,'#ddd'],[16,-1,'#E0E0E0'],[16,-2,'#E0E0E0'],[16,-3,'#ddd']] },
    { id:'ae4', label:'Fox Ears',    color:'#E8690A', owned:true,  pixels:[[8,-1,'#E8690A'],[8,-2,'#E8690A'],[9,-2,'#f0a87a'],[17,-1,'#E8690A'],[17,-2,'#E8690A'],[16,-2,'#f0a87a']] },
    { id:'ae5', label:'Bear',        color:'#5C3317', owned:false, pixels:[[8,-1,'#5C3317'],[9,-1,'#5C3317'],[16,-1,'#5C3317'],[17,-1,'#5C3317']] },
    { id:'ae6', label:'Wolf',        color:'#888888', owned:false, pixels:[[8,-1,'#888'],[8,-2,'#aaa'],[17,-1,'#888'],[17,-2,'#aaa']] },
    { id:'ae7', label:'Dragon Horns',color:'#B22222', owned:false, pixels:[[9,-1,'#B22222'],[9,-2,'#CC3333'],[10,-3,'#CC3333'],[16,-1,'#B22222'],[16,-2,'#CC3333'],[15,-3,'#CC3333']] },
    { id:'ae8', label:'Demon Horns', color:'#FF4500', owned:false, pixels:[[8,-2,'#FF4500'],[7,-3,'#FF6620'],[17,-2,'#FF4500'],[18,-3,'#FF6620']] },
  ],
  armour: [
    { id:'ar1', label:'Cloth Shirt',   owned:true,
      pixels:[[7,13,'#4A90D9'],[8,13,'#5A9FE8'],[9,13,'#4A90D9'],[10,13,'#5A9FE8'],[11,13,'#4A90D9'],[12,13,'#5A9FE8'],[13,13,'#4A90D9'],[14,13,'#5A9FE8'],[15,13,'#4A90D9'],[16,13,'#5A9FE8'],[17,13,'#4A90D9'],[18,13,'#5A9FE8'],
               [7,14,'#5A9FE8'],[8,14,'#4A90D9'],[9,14,'#5A9FE8'],[10,14,'#4A90D9'],[11,14,'#5A9FE8'],[12,14,'#4A90D9'],[13,14,'#5A9FE8'],[14,14,'#4A90D9'],[15,14,'#5A9FE8'],[16,14,'#4A90D9'],[17,14,'#5A9FE8'],[18,14,'#4A90D9']] },
    { id:'ar2', label:'Iron Armour',   owned:true  },
    { id:'ar3', label:'Purple Armour', owned:true  },
    { id:'ar4', label:'Gold Armour',   owned:true  },
    { id:'ar5', label:'Shadow Cloak',  owned:true },
    { id:'ar6', label:'Red Armour',    owned:true  },
    { id:'ar7',  label:'Crystal Armour', owned:false, pixels:[[7,13,'#A8D8EA'],[8,13,'#87CEEB'],[9,13,'#A8D8EA'],[10,13,'#B0E2FF'],[11,13,'#87CEEB'],[12,13,'#A8D8EA'],[13,13,'#A8D8EA'],[14,13,'#87CEEB'],[15,13,'#B0E2FF'],[16,13,'#A8D8EA'],[17,13,'#87CEEB'],[18,13,'#A8D8EA']] },
    { id:'ar8',  label:'Lava Armour',    owned:false, pixels:[[7,13,'#8B0000'],[8,13,'#FF4500'],[9,13,'#8B0000'],[10,13,'#FF6347'],[11,13,'#8B0000'],[12,13,'#FF4500'],[13,13,'#FF4500'],[14,13,'#8B0000'],[15,13,'#FF6347'],[16,13,'#8B0000'],[17,13,'#FF4500'],[18,13,'#8B0000']] },
    { id:'ar9',  label:'Celestial Robe', owned:false, pixels:[[7,13,'#1a1a4e'],[8,13,'#FFD700'],[9,13,'#1a1a4e'],[10,13,'#C0C0C0'],[11,13,'#1a1a4e'],[12,13,'#FFD700'],[13,13,'#FFD700'],[14,13,'#1a1a4e'],[15,13,'#C0C0C0'],[16,13,'#1a1a4e'],[17,13,'#FFD700'],[18,13,'#1a1a4e']] },
    { id:'ar10', label:'Abyssal Armour', owned:false, pixels:[[7,13,'#0d0d0d'],[8,13,'#1a0033'],[9,13,'#0d0d0d'],[10,13,'#4B0082'],[11,13,'#0d0d0d'],[12,13,'#1a0033'],[13,13,'#1a0033'],[14,13,'#0d0d0d'],[15,13,'#4B0082'],[16,13,'#0d0d0d'],[17,13,'#1a0033'],[18,13,'#0d0d0d']] },
  ],
  pets: [
    { id:'p1', label:'Fire Dragon',   color:'#FF6B35', emoji:'🐉', owned:true  },
    { id:'p2', label:'Ice Dragon',    color:'#74D7F7', emoji:'🐲', owned:true  },
    { id:'p3', label:'Shadow Drake',  color:'#7E57C2', emoji:'🦎', owned:false },
    { id:'p4', label:'Golden Wyvern', color:'#FFD700', emoji:'🌟', owned:true  },
    { id:'p5', label:'Storm Drake',   color:'#90CAF9', emoji:'⚡', owned:false },
    { id:'p6', label:'Void Dragon',   color:'#9C27B0', emoji:'🌑', owned:false },
  ],
};

const CATEGORIES = [
  { key:'skin',       label:'SKIN',        icon:'skin'    },
  { key:'hairStyle',  label:'HAIR STYLE',  icon:'hair'    },
  { key:'hairColor',  label:'HAIR COLOR',  icon:'palette' },
  { key:'animalEars', label:'ANIMAL EARS', icon:'ears'    },
  { key:'armour',     label:'ARMOUR',      icon:'shield'  },
  { key:'pets',       label:'PETS',        icon:'paw'     },
];

// ─── Category Icons ───────────────────────────────────────────────────────────
const CatIcon = ({ type, size=26 }) => {
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none',
    stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' };
  if (type === 'skin') {
    return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>;
  }
  const pngMap = {
    hair:    '/Avatars/hairstyle.png',
    palette: '/Avatars/hair-color.png',
    ears:    '/Avatars/petears.png',
    shield:  '/Avatars/armour.png',
    paw:     '/Avatars/pet.png',
  };
  const src = pngMap[type];
  if (src) {
    return <img src={src} alt={type} style={{ width:size, height:size, objectFit:'contain', display:'block' }} onError={(e)=>{e.target.style.display='none'}} />;
  }
  return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
};

// ─── Shop Modal ───────────────────────────────────────────────────────────────
const ShopModal = ({ category, selections, onSelect, onClose }) => {
  const items   = SHOP[category.key] || [];
  const current = selections[category.key];
  const hairCol = SHOP.hairColor.find(h => h.id === selections.hairColor)?.color || '#8B4513';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <CatIcon type={category.icon} size={22} />
          <h2 className="modal-title">{category.label}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="modal-subtitle">Tap an owned item to equip it</p>
        <div className="modal-grid">
          {items.map(item => (
            <div key={item.id}
              className={`modal-item ${!item.owned?'locked':''} ${current===item.id?'selected':''}`}
              onClick={() => item.owned && onSelect(item.id)}
              title={!item.owned ? '🔒 Buy from Shop to unlock' : item.label}
            >
              <div className="modal-item-visual">
                <PreviewIcon item={item} category={category.key} hairCol={hairCol} />
                {!item.owned && <div className="lock-overlay">🔒</div>}
                {current===item.id && item.owned && <div className="equipped-check">✓</div>}
              </div>
              <span className="modal-item-label">{item.label}</span>
              {item.owned
                ? <span className="owned-tag">Owned</span>
                : <span className="locked-tag">🔒 Locked</span>
              }
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <p className="modal-hint">🔒 Visit the <strong>Shop</strong> to unlock more</p>
          <button className="modal-done-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ─── Category Card ────────────────────────────────────────────────────────────
const CategoryCard = ({ cat, selections, onMore }) => {
  const items    = SHOP[cat.key] || [];
  const selected = items.find(i => i.id === selections[cat.key]);
  const previews = items.filter(i => i.owned).slice(0, 2);
  const hairCol  = SHOP.hairColor.find(h => h.id === selections.hairColor)?.color || '#8B4513';

  return (
    <div className="category-card" data-testid={`${cat.key}-card`}>
      <div className="category-card-header">
        <CatIcon type={cat.icon} size={28} />
        <h3 className="category-title">{cat.label}</h3>
      </div>
      <div className="category-previews">
        {previews.map(item => (
          <div key={item.id} className="cat-preview-wrap">
            <PreviewIcon item={item} category={cat.key} hairCol={hairCol} />
          </div>
        ))}
      </div>
      {selected && (
        <p className="category-equipped">Equipped: <strong>{selected.label}</strong></p>
      )}
      <button className="more-button" onClick={() => onMore(cat)}
        data-testid={`${cat.key}-more-btn`}>More</button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
// Now receives state as props from App.js instead of managing it internally
const ProgramAvatar = ({ avatarSelections, setAvatarSelections, avatarName, setAvatarName }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [saved,       setSaved]       = useState(false);

  const handleSelect = (key, id) => {
    setAvatarSelections(p => ({ ...p, [key]: id }));
    setActiveModal(null);
  };

  const equippedItems = CATEGORIES.map(cat => {
    const item = (SHOP[cat.key] || []).find(i => i.id === avatarSelections[cat.key]);
    return item ? { ...cat, itemLabel: item.label } : null;
  }).filter(Boolean);

  return (
    <div className="page-container">
      <div className="avatar-page-layout">

        {/* TOP: Avatar scene + Info panel */}
        <div className="avatar-top-section">
          <div className="avatar-preview-card" data-testid="avatar-main">
            <div className="avatar-scene">
              <SittingAvatar selections={avatarSelections} />
              {avatarSelections.pets && (
                <div className="pet-beside">
                  <PixelPet pet={SHOP.pets.find(i => i.id === avatarSelections.pets)} />
                  <span className="pet-name-tag">
                    {SHOP.pets.find(i => i.id === avatarSelections.pets)?.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="avatar-info-panel">
            <p className="section-title">YOUR AVATAR</p>
            <input
              type="text"
              placeholder="Enter your avatar name..."
              value={avatarName}
              onChange={e => { setAvatarName(e.target.value); setSaved(false); }}
              className="avatar-name-input"
              data-testid="avatar-name-input"
            />
            <div className="equipped-summary">
              <p className="equipped-summary-title">Currently Equipped</p>
              <div className="equipped-chips">
                {equippedItems.map(e => (
                  <div key={e.key} className="equipped-chip"
                    onClick={() => setActiveModal(CATEGORIES.find(c => c.key === e.key))}
                    style={{ cursor:'pointer' }}>
                    <CatIcon type={e.icon} size={13} />
                    <strong>{e.itemLabel}</strong>
                  </div>
                ))}
              </div>
            </div>
            <button className="create-button" onClick={() => setSaved(true)} data-testid="avatar-create-btn">
              CREATE AVATAR
            </button>
            {saved && avatarName && (
              <div className="avatar-saved-badge">✅ {avatarName} saved!</div>
            )}
          </div>
        </div>

        {/* BOTTOM: 6 Category Cards */}
        <div className="categories-panel">
          {CATEGORIES.map(cat => (
            <CategoryCard key={cat.key} cat={cat}
              selections={avatarSelections} onMore={setActiveModal} />
          ))}
        </div>
      </div>

      {activeModal && (
        <ShopModal
          category={activeModal}
          selections={avatarSelections}
          onSelect={id => handleSelect(activeModal.key, id)}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default ProgramAvatar;
