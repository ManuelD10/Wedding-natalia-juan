import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "motion/react";

import bgSection1 from "@/imports/background-section_1.png";
import bgSection2 from "@/imports/background-section_2.png";
import bgSection5 from "@/imports/background-section_5.png";
import fotoLugar from "@/imports/foto-lugar.png";
import mapaLugar from "@/imports/mapa-lugar.png";
import outfitMujeres from "@/imports/outfit-mujeres.jpeg";
import outfitHombres from "@/imports/outfit-hombres.png";
import sobreImg from "@/imports/sobre.png";
import cancionBoda from "@/imports/cancion_boda.mp3";

const TARGET = new Date("2027-02-20T17:00:00");

function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(33);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(cancionBoda);
    audio.loop = true;
    audio.volume = 0.33;
    audioRef.current = audio;

    // Autoplay: intentamos reproducir directamente
    const attempt = audio.play();
    if (attempt) {
      attempt
        .then(() => setPlaying(true))
        .catch(() => {
          // Bloqueado por política del navegador — se activa con primer toque
          const unlock = () => {
            audio.play().then(() => setPlaying(true)).catch(() => {});
            document.removeEventListener("click", unlock);
            document.removeEventListener("touchstart", unlock);
          };
          document.addEventListener("click", unlock, { once: true });
          document.addEventListener("touchstart", unlock, { once: true });
        });
    }

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v / 100;
      audioRef.current.muted = v === 0;
    }
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.muted = false;
      audio.volume = (volume || 33) / 100;
      setMuted(false);
    } else {
      audio.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">
      {/* Volume slider — expands upward */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0, originY: 1 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col items-center gap-2 rounded-2xl px-3 py-4 shadow-xl"
            style={{ backgroundColor: "rgba(58,34,16,0.92)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Inria Serif', serif" }}>
              {muted ? "silencio" : `${volume}%`}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={e => handleVolumeChange(Number(e.target.value))}
              className="h-24 cursor-pointer"
              style={{
                writingMode: "vertical-lr",
                direction: "rtl",
                accentColor: "#C9A96E",
              } as React.CSSProperties}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        onDoubleClick={toggleMute}
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:scale-105"
        style={{ backgroundColor: "rgba(58,34,16,0.9)", backdropFilter: "blur(8px)" }}
        aria-label="Control de música"
        title="Toca para abrir el volumen · Doble toque para silenciar"
      >
        {!playing ? (
          // Music note — waiting for autoplay permission
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="#C9A96E" strokeWidth="1.6"/>
            <circle cx="18" cy="16" r="3" stroke="#C9A96E" strokeWidth="1.6"/>
          </svg>
        ) : muted || volume === 0 ? (
          // Muted icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="rgba(255,255,255,0.55)"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ) : (
          // Speaker icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="rgba(255,255,255,0.55)"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#C9A96E" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#C9A96E" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function useCountdown() {
  const calc = () => {
    const diff = TARGET.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const serif = { fontFamily: "'Inria Serif', serif" };

function Swatch({ color, crossed = false }: { color: string; crossed?: boolean }) {
  return (
    <div className="relative flex-shrink-0 w-8 h-8">
      <div
        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: color }}
      />
      {crossed && (
        <svg viewBox="0 0 32 32" className="absolute inset-0 w-8 h-8 pointer-events-none" fill="none" />
      )}
    </div>
  );
}

export default function App() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [form, setForm] = useState({ name: "", guests: "1", attending: "yes", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    try {
      await emailjs.send(
        "service_ubly28f",
        "template_ix04l7f",
        {
          name: form.name,
          attending: form.attending === "yes" ? "✅ Sí asistirá" : "❌ No podrá asistir",
          guests: form.attending === "yes" ? form.guests : "—",
          message: form.message || "Sin mensaje",
        },
        "yr7HUpHM_JAROPiiJ"
      );
      setSubmitted(true);
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ fontFamily: "'Jost', sans-serif" }} className="overflow-x-hidden">
      <MusicPlayer />

      {/* ══════════════════════════════════════
          SECCIÓN 1 · HERO + CUENTA REGRESIVA
      ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col" style={{ backgroundColor: "#E5EEFF" }}>
        <img
          src={bgSection1}
          alt="Juan Esteban y Natalia"
          className="absolute inset-0 w-full h-full object-cover md:inset-y-0 md:right-auto md:left-1/2 md:-translate-x-1/2 md:w-[650px] md:h-full"
          style={{ objectPosition: "center 8%" }}
        />

        {/* Text overlay — aligned with the frosted white card in the image */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-start text-center pl-9 pr-3 md:px-6 pt-[36%] md:pt-[16%] lg:pt-[14%] md:translate-x-[10px]">
          

          <motion.p
            style={serif}
            className="italic text-[#504311] leading-relaxed max-w-[250px] md:max-w-[290px] mb-4 mt-8 text-[16px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          >
            Dicen que la magia existe para quienes creen en ella, nosotros la encontramos el día en que nuestras vidas se cruzaron, y desde entonces cada paso nos ha llevado hasta este instante.<br /><br />Con inmensa alegría, queremos que seas testigo del comienzo de <br /><b>nuestro para siempre.</b>
          </motion.p>

          <motion.h1
            style={{ ...serif, color: "#504311" }}
            className="font-light leading-snug mb-4 text-[32px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
          >
            Juan Esteban Torres
            <br />
            <span style={{ color: "#504311" }}>&amp;</span> Natalia Patiño
          </motion.h1>

          <motion.div
            className="flex items-center justify-center"
            style={{ color: "#504311" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4, ease: "easeOut" }}
          >
            <span style={serif} className="font-light tracking-[0.18em] text-[24px]">
              20 Feb 2027
            </span>
          </motion.div>
        </div>

        {/* Countdown strip at bottom of section */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 py-6 px-4 w-4/5 md:max-w-[520px] rounded-none"
          style={{ backgroundColor: "rgba(88, 95, 66)" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.9, ease: "easeOut" }}
        >
          <div className="flex justify-center items-start gap-0 max-w-sm mx-auto">
            {[
              { v: String(days).padStart(3, "0"), l: "días" },
              { v: pad(hours), l: "horas" },
              { v: pad(minutes), l: "minutos" },
              { v: pad(seconds), l: "segundos" },
            ].map((item, i) => (
              <div key={i} className="flex items-start">
                <div className="text-center px-2 md:px-4">
                  <div
                    style={{ ...serif, color: "#FFFFFF" }}
                    className="text-[32px] md:text-[42px] font-light tabular-nums leading-none"
                  >
                    {item.v}
                  </div>
                  <div className="text-[8px] tracking-[0.2em] uppercase mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {item.l}
                  </div>
                </div>
                {i < 3 && (
                  <span
                    style={{ ...serif, color: "rgba(255,255,255,0.35)" }}
                    className="text-2xl font-light mt-0.5 select-none"
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 2 · LUGAR
      ══════════════════════════════════════ */}
      <section className="relative md:overflow-hidden">
        <img
          src={bgSection2}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-10 py-16 md:pt-16 md:pb-0 px-4 text-center md:max-w-[650px] md:mx-auto">
          <motion.h2
            style={{ ...serif, color: "#504311" }}
            className="text-3xl md:text-4xl font-light italic mb-3 mt-6 md:mt-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
          >
            ¿Dónde nos casamos?
          </motion.h2>
          <motion.p
            style={{ ...serif, color: "#504311" }}
            className="text-xl md:text-2xl font-light"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          >
            Hacienda Makadamia
          </motion.p>
          <motion.p
            className="mt-1 tracking-wide font-[Inria_Serif] text-[20px]"
            style={{ color: "#504311" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
          >
            Km.2 Vía Guacari
          </motion.p>

          {/* Hacienda photo — PNG with transparent sky blends over floral bg */}
          <div className="mt-8 mx-0 px-0">
            <img
              src={fotoLugar}
              alt="Hacienda Makadamia"
              className="block relative w-screen left-1/2 -translate-x-1/2 -mb-16 md:static md:w-full md:left-0 md:translate-x-0 md:mb-0 object-contain"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 3 · MAPA / CÓMO LLEGAR
      ══════════════════════════════════════ */}
      <section className="py-14 md:py-18 px-4 text-center" style={{ backgroundColor: "#543A27" }}>
        <div className="max-w-[650px] mx-auto -mt-6">
        <motion.h2
          style={{ ...serif, color: "#FFFFFF", backgroundColor: "#543A27" }}
          className="text-3xl md:text-4xl font-light italic relative -mt-14 -translate-y-[50px] z-20 px-8 py-6 rounded-2xl inline-block mb-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
        >
          ¿Cómo llegar?
        </motion.h2>

        <div className="max-w-lg mx-auto">
          <motion.div
            className="rounded-2xl overflow-hidden shadow-2xl mb-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
          >
            <img
              src={mapaLugar}
              alt="Mapa hacia Hacienda Makadamia, Vía Guacari"
              className="w-full object-contain"
            />
          </motion.div>

          <motion.a
            href="https://maps.app.goo.gl/tRXNsDo6QZcrXNmL6"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-white tracking-[0.05em] px-10 py-6 rounded-full transition-colors font-[Inria_Serif] hover:opacity-90 active:scale-[0.98] text-[16px]"
            style={{ backgroundColor: "#3D200B", fontFamily: "'Inria Serif', serif" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
          >
            Cómo llegar
          </motion.a>
        </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 4 · VESTIMENTA
      ══════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-[650px] mx-auto">

          <div className="text-center mb-10 md:mb-12">
            <motion.h2
              style={{ ...serif, color: "#504311" }}
              className="text-3xl md:text-4xl font-light italic mb-3"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            >
              Inspiración para tu vestimenta
            </motion.h2>
            <motion.div
              className="w-7 h-px bg-[#9A8870] mx-auto mb-4"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            />
            <motion.p
              className="leading-relaxed max-w-xs mx-auto text-[19px]"
              style={{ color: "#504311", fontFamily: "'Hina Mincho', serif" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
            >
              Hemos preparado una celebración al aire libre.
              <br />
              Te sugerimos un estilo elegante y fresco.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">

            {/* ── MUJERES ── */}
            <div className="text-center">
              <motion.div
                className="rounded-2xl overflow-hidden mb-5 shadow-sm bg-[#F8F6F2]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
              >
                <img
                  src={outfitMujeres}
                  alt="Inspiración vestimenta mujeres"
                  className="w-full object-contain"
                />
              </motion.div>

              <motion.h3
                style={{ ...serif, color: "#504311" }}
                className="text-2xl font-light mb-1"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
              >
                Mujeres
              </motion.h3>
              <motion.p
                className="tracking-wide mb-5 text-[16px]"
                style={{ color: "#504311", fontFamily: "'Inria Serif', serif" }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
              >
                Vestido largo en tonos primaverales
              </motion.p>

              {/* Colores sugeridos */}
              <div className="flex justify-center gap-2.5 mb-5">
                {["#EA748E", "#F19135", "#F9DE85", "#96B3D1", "#E59CEE"].map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  >
                    <Swatch color={c} />
                  </motion.div>
                ))}
              </div>

              {/* Colores a evitar */}
              <motion.p
                className="tracking-normal mb-2.5 font-medium font-[Inria_Serif] text-[16px]"
                style={{ color: "#504311", fontFamily: "'Inria Serif', serif" }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 1.0, ease: "easeOut" }}
              >
                Evitar: blanco, verde militar y café
              </motion.p>
              <div className="flex justify-center gap-2.5">
                {["#FBFBFB", "#697542", "#7E4013"].map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: 1.1 + i * 0.1, ease: "easeOut" }}
                  >
                    <Swatch color={c} crossed />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── HOMBRES ── */}
            <div className="text-center">
              <motion.div
                className="rounded-2xl overflow-hidden mb-5 shadow-sm bg-[#F8F6F2]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
              >
                <img
                  src={outfitHombres}
                  alt="Inspiración vestimenta hombres"
                  className="w-full object-contain"
                />
              </motion.div>

              <motion.h3
                style={{ ...serif, color: "#504311" }}
                className="text-2xl font-light mb-1"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
              >
                Hombres
              </motion.h3>
              <motion.p
                className="tracking-wide text-[20px]"
                style={{ color: "#504311", fontFamily: "'Hina Mincho', serif" }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
              >
                Traje formal
              </motion.p>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECCIÓN 5 · REGALO / SOBRE
      ══════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <img
          src={bgSection5}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-10 max-w-md mx-auto text-center">
          <div className="relative max-w-[400px] md:max-w-[480px] mx-auto">
            {/* Envelope - base */}
            <img
              src={sobreImg}
              alt="Lluvia de sobres"
              className="w-full object-contain drop-shadow-xl"
            />
            {/* White card - absolute, anchored to bottom of envelope */}
            <motion.div
              className="absolute bottom-30 left-1/2 -translate-x-1/2 w-[75%] bg-white shadow-xl px-8 py-10 text-center"
              initial={{ y: 80 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              <h2
                style={{ ...serif, color: "#504311" }}
                className="text-3xl md:text-4xl font-light leading-tight mb-4"
              >
                Tu presencia será el
                <br />
                mejor regalo para
                <br />
                nosotros,
              </h2>

              <div className="w-7 h-px mx-auto mb-4" style={{ backgroundColor: "rgba(80,67,17,0.35)" }} />

              <p className="leading-relaxed font-[Inria_Serif] text-[16px]" style={{ color: "#504311" }}>
                Si deseas tener un detalle con nosotros, hemos elegido{" "}
                <span className="font-semibold">lluvia de sobres</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ font-[Inria_Serif]═══════════════════════════════════
          SECCIÓN 6 · RSVP
      ══════════════════════════════════════ */}
      <section className="py-16 md:py-20 px-4" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-[650px] mx-auto">

          <div className="text-center mb-8">
            <motion.h2
              style={{ ...serif, color: "#504311" }}
              className="text-3xl md:text-4xl font-light italic mb-3"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            >
              ¿Nos acompañas a vivir este capítulo?
            </motion.h2>
            <motion.div
              className="w-7 h-px bg-[#9A8870] mx-auto mb-4"
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            />
            <motion.p
              className="leading-relaxed max-w-sm mx-auto font-[Inria_Serif] text-[16px]"
              style={{ color: "#504311" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
            >
              Queremos celebrar este momento rodeados de las personas que más queremos. <span className="font-bold">Confirma tu asistencia diligenciando la siguiente información.</span>
            </motion.p>
          </div>

          {submitted ? (
            <div
              className="rounded-2xl p-10 text-center border"
              style={{ backgroundColor: "#FAF8F4", borderColor: "#E8DFD0" }}
            >
              <div style={{ ...serif, color: "#9A8870", fontSize: "3rem" }} className="mb-4">
                ✦
              </div>
              <h3 style={{ ...serif, color: "#504311" }} className="text-2xl font-light mb-2">
                ¡Gracias!
              </h3>
              <p className="text-sm" style={{ color: "#504311" }}>
                Hemos recibido tu confirmación.
                <br />
                ¡Nos vemos el 20 de febrero de 2027!
              </p>
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 md:p-8 border space-y-5"
              style={{ backgroundColor: "#FAF8F4", borderColor: "#E8DFD0" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
            >
              {/* Nombre */}
              <div>
                <label
                  className="block text-[13px] tracking-[0.02em] mb-2"
                  style={{ color: "#504311", fontFamily: "'Inria Serif', serif" }}
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none transition-colors placeholder:text-[#C0B4A0]"
                  style={{ border: "1px solid #D8CFBF", color: "#504311" }}
                />
              </div>

              {/* Asistencia */}
              <div>
                <label
                  className="block text-[13px] tracking-[0.02em] mb-2"
                  style={{ color: "#504311", fontFamily: "'Inria Serif', serif" }}
                >
                  ¿Asistirás?
                </label>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, attending: v })}
                      className="flex-1 py-3 rounded-xl text-sm border transition-all active:scale-[0.98]"
                      style={
                        form.attending === v
                          ? { backgroundColor: "#543A27", color: "#ffffff", borderColor: "#543A27" }
                          : { backgroundColor: "#ffffff", color: "#7A6A58", borderColor: "#D8CFBF" }
                      }
                    >
                      {v === "yes" ? "Con gusto asistiré" : "No podré asistir"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acompañantes */}
              {form.attending === "yes" && (
                <div>
                  <label
                    className="block text-[13px] tracking-[0.02em] mb-2"
                    style={{ color: "#504311", fontFamily: "'Inria Serif', serif" }}
                  >
                    Número de acompañantes
                  </label>
                  <select
                    value={form.guests}
                    onChange={e => setForm({ ...form, guests: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none transition-colors"
                    style={{ border: "1px solid #D8CFBF", color: "#504311" }}
                  >
                    {["1", "2", "3", "4"].map(n => (
                      <option key={n} value={n}>
                        {n} {n === "1" ? "persona" : "personas"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mensaje */}
              <div>
                <label
                  className="block text-[13px] tracking-[0.02em] mb-2"
                  style={{ color: "#504311", fontFamily: "'Inria Serif', serif" }}
                >
                  Mensaje (opcional)
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  placeholder="Déjanos un mensaje para los novios..."
                  className="w-full rounded-xl px-4 py-3 text-sm bg-white focus:outline-none resize-none transition-colors placeholder:text-[#C0B4A0]"
                  style={{ border: "1px solid #D8CFBF", color: "#504311" }}
                />
              </div>

              {sendError && (
                <p className="text-center text-sm" style={{ color: "#b91c1c", fontFamily: "'Inria Serif', serif" }}>
                  Hubo un problema al enviar. Por favor intenta de nuevo.
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full text-white py-4 rounded-xl text-[11px] tracking-[0.3em] uppercase font-medium transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                style={{ backgroundColor: "#543A27" }}
              >
                {sending ? "Enviando…" : "Confirmar asistencia"}
              </button>
            </motion.form>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="py-8 text-center" style={{ backgroundColor: "#3A2210" }}>
        <div style={{ ...serif, color: "rgba(255,255,255,0.75)" }} className="text-xl font-light mb-1">
          Juan Esteban &amp; Natalia
        </div>
        <div className="text-[10px] tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.35)" }}>
          20 · 02 · 2027
        </div>
      </footer>

    </div>
  );
}
