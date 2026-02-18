import { useSkills, useUpdateSkill } from "@/hooks/useData";

export default function SkillsPage() {
  const { data: skills = [] } = useSkills();
  const updateSkill = useUpdateSkill();

  const toggleSkill = (id: string, currentEnabled: boolean) => {
    updateSkill.mutate({ id, enabled: !currentEnabled });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Skills</h1>
      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skill.icon}</span>
                <div>
                  <h3 className="font-semibold text-card-foreground">{skill.name}</h3>
                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSkill(skill.id, skill.enabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  skill.enabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-card rounded-full shadow transition-transform ${
                    skill.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {skill.enabled && skill.config && typeof skill.config === "object" && Object.keys(skill.config).length > 0 && (
              <div className="mt-3 p-3 bg-muted rounded-md text-xs text-muted-foreground font-mono">
                {JSON.stringify(skill.config, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
