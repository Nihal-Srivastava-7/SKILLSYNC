import React from "react";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// PDF styles mapped to palette
const styles = StyleSheet.create({
  page: { padding: 24, backgroundColor: "#FFFFFF" },
  name: { fontSize: 20, fontWeight: 700, color: "#1F2937" },
  small: { fontSize: 10, color: "#4B5563", marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1E3A8A",
    marginTop: 12,
    marginBottom: 6,
  },
  itemTitle: { fontSize: 11, fontWeight: 600, color: "#1F2937" },
  paragraph: { fontSize: 10, color: "#111827", marginTop: 2 },
  chip: {
    fontSize: 9,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  row: { flexDirection: "row", flexWrap: "wrap" },
});

function ResumePDF({ resume }) {
  const p = resume.personal || {};
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.name}>{p.fullName || "Your Name"}</Text>
          <Text style={styles.small}>
            {[p.email, p.phone, p.location].filter(Boolean).join(" • ")}
          </Text>
          {p.headline ? <Text style={styles.small}>{p.headline}</Text> : null}
          {p.summary ? <Text style={styles.paragraph}>{p.summary}</Text> : null}
        </View>

        {/* Skills */}
        {resume.skills?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.row}>
              {resume.skills.map((s, i) => (
                <Text key={i} style={styles.chip}>
                  {s}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Education */}
        {resume.education?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((e) => (
              <View key={e._id} wrap={false}>
                <Text style={styles.itemTitle}>
                  {e.school} {e.degree ? `• ${e.degree}` : ""}{" "}
                  {e.field ? `(${e.field})` : ""}
                </Text>
                {e.description ? (
                  <Text style={styles.paragraph}>{e.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {resume.projects?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((p) => (
              <View key={p._id} wrap={false}>
                <Text style={styles.itemTitle}>{p.title}</Text>
                {p.summary ? (
                  <Text style={styles.paragraph}>{p.summary}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export default function ResumePDFButton({ resume }) {
  return (
    <PDFDownloadLink
      document={<ResumePDF resume={resume} />}
      fileName="SkillSync_Resume.pdf"
      className="inline-flex items-center rounded-md px-4 py-2 bg-[#1E3A8A] text-white hover:bg-[#192f72] transition"
    >
      {({ loading }) => (loading ? "Preparing PDF…" : "Download PDF")}
    </PDFDownloadLink>
  );
}
