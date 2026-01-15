import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";
import "./styles/normalize.css";

const floatAnimation = keyframes`
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(30px, -40px);
  }
  50% {
    transform: translate(-20px, 40px);
  }
  75% {
    transform: translate(40px, 20px);
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    opacity: 0.16;
    filter: blur(18px);
  }
  50% {
    opacity: 0.22;
    filter: blur(24px);
  }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #0f0b1a 0%, #0b0a12 40%, #0a0b16 100%);
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.5), transparent 70%);
  pointer-events: none;
  animation: ${glowAnimation} 4s ease-in-out infinite;
`;

const Glow = styled.div`
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 50% 50%, rgba(123, 104, 238, 0.16), transparent 45%),
    radial-gradient(circle at 20% 70%, rgba(34, 224, 123, 0.12), transparent 30%),
    radial-gradient(circle at 80% 30%, rgba(76, 176, 255, 0.18), transparent 30%);
  filter: blur(18px);
  pointer-events: none;
  animation: ${floatAnimation} 12s ease-in-out infinite;
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  width: min(600px, 100%);
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.02);
  text-align: center;
`;

const Title = styled.h1`
  font-size: clamp(1.8rem, 5vw, 2.4rem);
  margin: 0 0 0.5rem;
  font-weight: 700;
  color: #f6f7fb;
  background: linear-gradient(135deg, #f6f7fb 0%, #b9bed5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  margin: 0 0 1.5rem;
  color: #b9bed5;
  font-size: clamp(1rem, 3vw, 1.1rem);
  font-weight: 500;
`;

const IPContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  margin: 1.5rem 0;
`;

const IPText = styled.div`
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-weight: 700;
  color: #f6f7fb;
  font-family: "Poppins", monospace;
  letter-spacing: 0.02em;
  word-break: break-all;
`;

const CopyButton = styled.button`
  appearance: none;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #7b68ee 0%, #4cb0ff 100%);
  color: #0b0a12;
  font-weight: 700;
  font-size: clamp(1rem, 3vw, 1.15rem);
  padding: clamp(0.8rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2.5rem);
  cursor: pointer;
  font-family: "Poppins", sans-serif;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 16px 40px rgba(76, 176, 255, 0.3);
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 20px 50px rgba(76, 176, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Status = styled.p`
  margin: 1rem 0 0;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  color: #c8cbe0;
  min-height: 24px;
`;

const Footer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #7b7d95;
  background: linear-gradient(to top, rgba(15, 11, 26, 0.8), transparent);
  pointer-events: none;

  a {
    color: #b9bed5;
    text-decoration: none;
    transition: color 0.2s ease;
    pointer-events: auto;

    &:hover {
      color: #7b68ee;
    }
  }
`;

export default function App() {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadIp() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("https://api.ipify.org?format=json", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data = await response.json();
        setIp(data?.ip || "");
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Erro ao obter IP público", err);
          setError("Não foi possível obter o IP público agora.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadIp();
    return () => controller.abort();
  }, []);

  const handleCopy = async () => {
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Erro ao copiar IP", err);
      window.prompt("Copie o IP:", ip);
    }
  };

  const displayIp = loading ? "Buscando..." : error ? "--" : ip;
  const statusText = error
    ? error
    : loading
    ? "Consultando..."
    : copied
    ? "IP copiado! ✓"
    : "Pronto para uso.";

  return (
    <Page>
      <Glow />
      <GridOverlay />
      <Card>
        <Title>Seu IP Público é:</Title>
        <Subtitle>Copie com um clique!</Subtitle>
        <IPContainer>
          <IPText>{displayIp}</IPText>
          <CopyButton
            onClick={handleCopy}
            disabled={!ip || Boolean(error) || loading}
          >
            {copied ? "COPIADO ✓" : "COPIAR"}
          </CopyButton>
        </IPContainer>
        <Status>{statusText}</Status>
      </Card>
      <Footer>
        Powered by <a href="https://argonauts.com.br" target="_blank" rel="noopener noreferrer">Argonauts Soluções LTDA</a>
      </Footer>
    </Page>
  );
}
