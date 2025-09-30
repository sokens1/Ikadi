import { createClient } from '@supabase/supabase-js';

// Minimal types to avoid extra deps
type VercelRequest = any;
type VercelResponse = any;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function normalizeCandidateName(name?: string): string | undefined {
  if (!name) return name;
  let fixed = name;
  
  // Normaliser les espaces
  fixed = fixed.replace(/\s+/g, ' ').trim();
  
  // Corrections spécifiques pour LEBOMO
  if (/LEBOMO/i.test(fixed)) {
    // Remplacer Albert par Arnauld (priorité haute)
    fixed = fixed.replace(/\bAlbert\b/gi, 'Arnauld');
    // Remplacer Arnaud par Arnauld
    fixed = fixed.replace(/\bArnaud\b/gi, 'Arnauld');
    // Remplacer Claubert par Clobert
    fixed = fixed.replace(/\bClaubert\b/gi, 'Clobert');
    
    // Forcer la correction pour LEBOMO spécifiquement
    const parts = fixed.split(' ');
    if (parts.length >= 3 && /^(LEBOMO)$/i.test(parts[0])) {
      parts[1] = 'Arnauld';
      parts[2] = 'Clobert';
      fixed = parts.join(' ');
    }
  } else {
    // Corrections générales pour tous les autres candidats
    fixed = fixed.replace(/\bAlbert\b/gi, 'Arnauld');
    fixed = fixed.replace(/\bArnaud\b/gi, 'Arnauld');
    fixed = fixed.replace(/\bClaubert\b/gi, 'Clobert');
  }
  
  return fixed;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query || {};
  const electionId = Array.isArray(id) ? id[0] : id;

  const baseUrl = 'https://www.ohitu.com';
  const canonicalUrl = `${baseUrl}/election/${encodeURIComponent(String(electionId))}/results`;
  const ogImage = `${baseUrl}/images/resultat_election.jpg?v=5`;

  let title = "Résultats des Élections Locales et Législatives";
  let description = "🗳️ Résultats en temps réel. Transparence & Sécurité. République Gabonaise.";

  try {
    if (supabase) {
      // Fetch top candidate for the election
      const { data: candidatesAgg } = await supabase
        .from('election_candidates')
        .select(`
          candidates(id, name, party),
          candidate_results(votes)
        `)
        .eq('election_id', electionId);

      if (candidatesAgg && candidatesAgg.length > 0) {
        // Compute winner by highest total votes
        const results = candidatesAgg.map((item: any) => {
          const totalVotes = (item.candidate_results || []).reduce((sum: number, r: any) => sum + (r.votes || 0), 0);
          return { name: item.candidates?.name as string | undefined, totalVotes };
        });
        results.sort((a: any, b: any) => b.totalVotes - a.totalVotes);
        const winner = results[0];
        const winnerName = normalizeCandidateName(winner?.name);
        if (winnerName) {
          title = `${winnerName} en tête | Résultats Élections`;
          description = `🗳️ ${winnerName} en tête • Résultats en temps réel. Transparence & Sécurité.`;
        }
      }
    }
  } catch {
    // Fallback: keep default title/description
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalUrl}" />

    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:secure_url" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="o'Hitu" />
    <meta property="og:locale" content="fr_GA" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />

    <meta http-equiv="refresh" content="0; url=${canonicalUrl}?src=wa" />
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px}</style>
  </head>
  <body>
    <p>Redirection… Si vous n'êtes pas redirigé, <a href="${canonicalUrl}?src=wa">cliquez ici</a>.</p>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}


